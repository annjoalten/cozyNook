import type { AlexaResponse } from './types';

export function buildResponse(
  text: string,
  options: { endSession?: boolean; reprompt?: string } = {},
): AlexaResponse {
  return {
    version: '1.0',
    response: {
      outputSpeech: { type: 'PlainText', text },
      shouldEndSession: options.endSession ?? true,
      ...(options.reprompt && {
        reprompt: {
          outputSpeech: { type: 'PlainText', text: options.reprompt },
        },
      }),
    },
  };
}

export const WELCOME = buildResponse(
  'Hola! Soy cozyNook. Puedo ayudarte a encontrar cosas en casa, gestionar tu lista de compras o ver tus préstamos. ¿En qué te ayudo?',
  {
    endSession: false,
    reprompt: '¿En qué puedo ayudarte? Prueba decir: ¿dónde están mis llaves?',
  },
);

export const ERROR = buildResponse(
  'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.',
);

export const GOODBYE = buildResponse('¡Hasta luego!');

export const NO_QUERY = buildResponse(
  '¿En qué puedo ayudarte? Puedes preguntarme dónde están tus cosas, qué tienes en la lista de compras, o decirme que añada algo.',
  {
    endSession: false,
    reprompt: '¿En qué te ayudo?',
  },
);
