/**
 * Webhook para el Alexa Custom Skill de cozyNook.
 *
 * Configuración en Alexa Developer Console:
 *   - Endpoint type: HTTPS
 *   - Endpoint URL: https://<tu-dominio>/api/alexa
 *   - Certificate: "My development endpoint is a sub-domain of a domain that has a wildcard certificate"
 *
 * Intents necesarios en el Skill:
 *   - AsistenteIntent  →  slot: consulta (tipo: AMAZON.SearchQuery)
 *   - AMAZON.StopIntent, AMAZON.CancelIntent, AMAZON.HelpIntent  (built-in)
 *
 * Utterances de ejemplo para AsistenteIntent:
 *   - pregunta {consulta}
 *   - dime {consulta}
 *   - quiero saber {consulta}
 *
 * Estrategia de resolución:
 *   1. Fallback (pattern matching sin IA) → no gasta tokens
 *   2. Claude (solo si el fallback no resuelve) → gasta tokens
 *   3. Si Claude falla, se cachea el error 10 min para no reintentar
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildResponse, WELCOME, ERROR, GOODBYE, NO_QUERY } from '../../../lib/alexa/responses';
import { handleWithClaude } from '../../../lib/alexa/claude';
import { handleWithFallback } from '../../../lib/alexa/fallback';
import type { AlexaRequest } from '../../../lib/alexa/types';

// Cache en memoria: si Claude falla por créditos, no reintentar durante 10 min
let claudeUnavailableUntil: number | null = null;
const CLAUDE_RETRY_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutos

function isClaudeAvailable(): boolean {
  if (!claudeUnavailableUntil) return true;
  if (Date.now() > claudeUnavailableUntil) {
    claudeUnavailableUntil = null; // cooldown expirado
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
    const { type } = body.request;

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
            'Di "dime" seguido de tu consulta. Por ejemplo: dime dónde están mis llaves, dime mi lista de compras, dime mis préstamos, o dime el resumen de casa.',
            { endSession: false, reprompt: '¿En qué te ayudo?' },
          ),
        );
      }

      const utterance = body.request.intent?.slots?.consulta?.value?.trim() ?? '';

      if (!utterance) {
        return NextResponse.json(NO_QUERY);
      }

      // 1️⃣ Intentar fallback primero — no gasta tokens
      const fallback = await handleWithFallback(utterance).catch(() => ({ handled: false as const }));
      if (fallback.handled) {
        return NextResponse.json(buildResponse(fallback.response));
      }

      // 2️⃣ Si Claude no está disponible (créditos agotados en cooldown), avisamos
      if (!isClaudeAvailable()) {
        return NextResponse.json(
          buildResponse(
            'Esta consulta necesita inteligencia artificial, pero la cuenta de Anthropic no tiene créditos disponibles. Recarga el saldo para poder ayudarte con esto.',
          ),
        );
      }

      // 3️⃣ Intentar con Claude
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
              'La cuenta de Anthropic se ha quedado sin créditos. Esta consulta necesita IA para procesarse. Por favor, recarga el saldo en la consola de Anthropic.',
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
