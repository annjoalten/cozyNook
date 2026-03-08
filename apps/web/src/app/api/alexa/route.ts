/**
 * Webhook para el Alexa Custom Skill de cozyNook.
 *
 * Configuración en Alexa Developer Console:
 *   - Endpoint type: HTTPS
 *   - Certificate: "My development endpoint is a sub-domain of a domain that has a wildcard certificate"
 *   - Slot type: CONSULTA_LIBRE (custom) — AMAZON.SearchQuery no está disponible en español
 *
 * Estrategia de resolución:
 *   1. Validación de timestamp (< 150 seg) para evitar replay attacks
 *   2. Fallback (pattern matching sin IA) → no gasta tokens
 *   3. Claude (solo si el fallback no resuelve) → gasta tokens
 *   4. Si Claude falla por créditos, se cachea 10 min para no reintentar
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildResponse, WELCOME, ERROR, GOODBYE, NO_QUERY } from '../../../lib/alexa/responses';
import { handleWithClaude } from '../../../lib/alexa/claude';
import { handleWithFallback } from '../../../lib/alexa/fallback';
import type { AlexaRequest } from '../../../lib/alexa/types';

const TIMESTAMP_TOLERANCE_MS = 150_000; // 150 segundos — requerimiento de Alexa

function isTimestampValid(timestamp: string): boolean {
  const requestTime = new Date(timestamp).getTime();
  return Math.abs(Date.now() - requestTime) < TIMESTAMP_TOLERANCE_MS;
}

// Cache en memoria: si Claude falla por créditos, no reintentar durante 10 min
let claudeUnavailableUntil: number | null = null;
const CLAUDE_RETRY_COOLDOWN_MS = 10 * 60 * 1000;

function isClaudeAvailable(): boolean {
  if (!claudeUnavailableUntil) return true;
  if (Date.now() > claudeUnavailableUntil) {
    claudeUnavailableUntil = null;
    return true;
  }
  return false;
}

function markClaudeUnavailable() {
  claudeUnavailableUntil = Date.now() + CLAUDE_RETRY_COOLDOWN_MS;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AlexaRequest;
    const { type, timestamp } = body.request;

    // Validación de timestamp (requerimiento de seguridad de Alexa)
    if (!isTimestampValid(timestamp)) {
      console.warn('[Alexa webhook] Timestamp inválido:', timestamp);
      return NextResponse.json(ERROR, { status: 400 });
    }

    if (type === 'LaunchRequest') {
      return NextResponse.json(WELCOME);
    }

    if (type === 'SessionEndedRequest') {
      return NextResponse.json(GOODBYE);
    }

    if (type === 'IntentRequest') {
      const intentName = body.request.intent?.name ?? '';

      if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        return NextResponse.json(GOODBYE);
      }

      if (intentName === 'AMAZON.HelpIntent') {
        return NextResponse.json(
          buildResponse(
            'Di "nook dime" seguido de tu consulta. Por ejemplo: nook dime dónde están mis llaves, nook lista mis compras, nook dime mis préstamos, o nook dime el resumen de casa.',
            { endSession: false, reprompt: '¿En qué te ayudo?' },
          ),
        );
      }

      const utterance = body.request.intent?.slots?.consulta?.value?.trim() ?? '';

      if (!utterance) {
        return NextResponse.json(NO_QUERY);
      }

      // 1️⃣ Fallback sin IA — no gasta tokens
      const fallback = await handleWithFallback(utterance).catch(() => ({ handled: false as const }));
      if (fallback.handled) {
        return NextResponse.json(buildResponse(fallback.response));
      }

      // 2️⃣ Si Claude está en cooldown por créditos, avisamos
      if (!isClaudeAvailable()) {
        return NextResponse.json(
          buildResponse(
            'Esta consulta necesita inteligencia artificial, pero la cuenta de Anthropic no tiene créditos disponibles. Recarga el saldo para poder ayudarte.',
          ),
        );
      }

      // 3️⃣ Claude
      try {
        const responseText = await handleWithClaude(utterance);
        return NextResponse.json(buildResponse(responseText));
      } catch (error) {
        console.error('[Alexa webhook] Error de Claude:', error);
        const message = error instanceof Error ? error.message : '';
        const isCreditsError =
          message.includes('credit balance is too low') ||
          message.includes('Your credit balance');

        if (isCreditsError) {
          markClaudeUnavailable();
          return NextResponse.json(
            buildResponse(
              'La cuenta de Anthropic se ha quedado sin créditos. Esta consulta necesita IA para procesarse. Por favor, recarga el saldo.',
            ),
          );
        }

        return NextResponse.json(ERROR);
      }
    }

    return NextResponse.json(ERROR);
  } catch (error) {
    console.error('[Alexa webhook] Error:', error);
    return NextResponse.json(ERROR);
  }
}
