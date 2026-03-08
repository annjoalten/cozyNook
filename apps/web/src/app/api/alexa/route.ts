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

      const responseText = await handleWithClaude(utterance);
      return NextResponse.json(buildResponse(responseText));
    }

    return NextResponse.json(ERROR);
  } catch (error) {
    console.error('[Alexa webhook] Error:', error);
    return NextResponse.json(ERROR);
  }
}
