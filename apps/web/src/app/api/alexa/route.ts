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

function isCreditsError(message: string): boolean {
  return (
    message.includes('credit balance is too low') ||
    message.includes('Your credit balance')
  );
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

      // Intents directos sin slot — siempre resueltos por fallback, sin tocar Claude
      if (intentName === 'ResumenIntent' ||
          intentName === 'ListaComprasIntent' ||
          intentName === 'PrestamosIntent') {
        const queryMap: Record<string, string> = {
          ResumenIntent: 'resumen',
          ListaComprasIntent: 'lista de compras',
          PrestamosIntent: 'préstamos',
        };
        const fallback = await handleWithFallback(queryMap[intentName]).catch(() => ({ handled: false as const }));
        return NextResponse.json(
          fallback.handled ? buildResponse(fallback.response) : ERROR,
        );
      }

      if (intentName === 'AMAZON.HelpIntent') {
        return NextResponse.json(
          buildResponse(
            'Los comandos rápidos son: nook lista, nook préstamos y nook resumen. Para buscar cosas di: nook dime dónde están tus llaves. Para apuntar: nook apunta comprar leche.',
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

      // 2️⃣ Claude
      try {
        const responseText = await handleWithClaude(utterance);
        return NextResponse.json(buildResponse(responseText));
      } catch (error) {
        console.error('[Alexa webhook] Error de Claude:', error);
        const message = error instanceof Error ? error.message : '';

        if (isCreditsError(message)) {
          return NextResponse.json(
            buildResponse(
              'La cuenta de Anthropic se ha quedado sin créditos. Por favor, recarga el saldo en la consola de Anthropic.',
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
