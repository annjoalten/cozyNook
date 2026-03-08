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
 *   - {consulta}
 *   - pregunta {consulta}
 *   - dime {consulta}
 *   - quiero saber {consulta}
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildResponse, WELCOME, ERROR, GOODBYE, NO_QUERY } from '../../../lib/alexa/responses';
import { handleWithClaude } from '../../../lib/alexa/claude';
import { handleWithFallback } from '../../../lib/alexa/fallback';
import type { AlexaRequest } from '../../../lib/alexa/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AlexaRequest;
    const { type } = body.request;

    // Alexa abrió el skill sin un comando concreto
    if (type === 'LaunchRequest') {
      return NextResponse.json(WELCOME);
    }

    // Sesión terminada (no requiere respuesta con audio)
    if (type === 'SessionEndedRequest') {
      return NextResponse.json(GOODBYE);
    }

    if (type === 'IntentRequest') {
      const intentName = body.request.intent?.name ?? '';

      // Intents de cierre / ayuda built-in
      if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        return NextResponse.json(GOODBYE);
      }

      if (intentName === 'AMAZON.HelpIntent') {
        return NextResponse.json(
          buildResponse(
            'Puedes preguntarme cosas como: ¿dónde están mis llaves?, añade leche a la lista de compras, o ¿quién tiene mi taladro?',
            { endSession: false, reprompt: '¿En qué te ayudo?' },
          ),
        );
      }

      // Intent principal con query libre (AsistenteIntent)
      const utterance = body.request.intent?.slots?.consulta?.value?.trim() ?? '';

      if (!utterance) {
        return NextResponse.json(NO_QUERY);
      }

      try {
        const responseText = await handleWithClaude(utterance);
        return NextResponse.json(buildResponse(responseText));
      } catch (error) {
        console.error('[Alexa webhook] Error:', error);
        const message = error instanceof Error ? error.message : '';
        const isCreditsError =
          message.includes('credit balance is too low') ||
          message.includes('Your credit balance');

        // Intentar fallback sin IA antes de rendirse
        const fallback = await handleWithFallback(utterance).catch(() => ({ handled: false as const }));
        if (fallback.handled) {
          const suffix = isCreditsError
            ? ' Nota: la IA no está disponible ahora mismo, puede que esta respuesta necesite refinarse.'
            : '';
          return NextResponse.json(buildResponse(fallback.response + suffix));
        }

        if (isCreditsError) {
          return NextResponse.json(
            buildResponse(
              'La cuenta de Anthropic se ha quedado sin créditos y tu consulta necesita inteligencia artificial para procesarse. Por favor, recarga el saldo.',
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
