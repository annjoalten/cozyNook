/**
 * Tests para el webhook POST /api/alexa.
 *
 * Garantiza el routing correcto por tipo de request Alexa:
 *   - Timestamp inválido → 400
 *   - LaunchRequest → WELCOME (sesión abierta)
 *   - SessionEndedRequest → GOODBYE (sesión cerrada)
 *   - Intents de sistema (Stop, Cancel, Help)
 *   - Intents directos (Resumen, Lista, Préstamos) → fallback, NUNCA Claude
 *   - AsistenteIntent → fallback → Claude si es necesario
 *   - Manejo de errores de Claude (créditos vs genérico)
 *
 * handleWithFallback y handleWithClaude están mockeados para aislar el webhook.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../../../lib/alexa/fallback', () => ({
  handleWithFallback: vi.fn(),
}));

vi.mock('../../../lib/alexa/claude', () => ({
  handleWithClaude: vi.fn(),
}));

import { POST } from '../../../app/api/alexa/route';
import { handleWithFallback } from '../../../lib/alexa/fallback';
import { handleWithClaude } from '../../../lib/alexa/claude';

const mockFallback = vi.mocked(handleWithFallback);
const mockClaude = vi.mocked(handleWithClaude);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Timestamp ISO dentro de la ventana de 150s. */
const freshTimestamp = () => new Date().toISOString();

/** Timestamp con 200s de antigüedad → inválido para Alexa. */
const expiredTimestamp = () => new Date(Date.now() - 200_000).toISOString();

function makeRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/alexa', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeIntent(
  intentName: string,
  slotValue?: string,
  timestamp = freshTimestamp(),
) {
  return makeRequest({
    version: '1.0',
    request: {
      type: 'IntentRequest',
      requestId: 'test-req',
      timestamp,
      locale: 'es-ES',
      intent: {
        name: intentName,
        confirmationStatus: 'NONE',
        ...(slotValue !== undefined && {
          slots: {
            consulta: { name: 'consulta', value: slotValue, confirmationStatus: 'NONE' },
          },
        }),
      },
    },
  });
}

async function parseBody(response: Response) {
  return response.json();
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockFallback.mockResolvedValue({ handled: false });
  mockClaude.mockResolvedValue('Respuesta de Claude.');
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. TIMESTAMP VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

describe('validación de timestamp', () => {
  it('timestamp válido (< 150s) → procesa normalmente', async () => {
    const req = makeRequest({
      version: '1.0',
      request: { type: 'LaunchRequest', requestId: 'r1', timestamp: freshTimestamp(), locale: 'es-ES' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await parseBody(res);
    expect(body.response.outputSpeech.text).toContain('Hola');
  });

  it('timestamp expirado (> 150s) → 400 con respuesta de error', async () => {
    const req = makeRequest({
      version: '1.0',
      request: { type: 'LaunchRequest', requestId: 'r1', timestamp: expiredTimestamp(), locale: 'es-ES' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await parseBody(res);
    expect(body.response.outputSpeech.text).toContain('error');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. LAUNCH REQUEST
// ─────────────────────────────────────────────────────────────────────────────

describe('LaunchRequest', () => {
  it('devuelve WELCOME con sesión abierta', async () => {
    const req = makeRequest({
      version: '1.0',
      request: { type: 'LaunchRequest', requestId: 'r1', timestamp: freshTimestamp(), locale: 'es-ES' },
    });
    const body = await parseBody(await POST(req));
    expect(body.response.outputSpeech.text).toContain('nook');
    expect(body.response.shouldEndSession).toBe(false);
  });

  it('WELCOME incluye reprompt', async () => {
    const req = makeRequest({
      version: '1.0',
      request: { type: 'LaunchRequest', requestId: 'r1', timestamp: freshTimestamp(), locale: 'es-ES' },
    });
    const body = await parseBody(await POST(req));
    expect(body.response.reprompt).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. SESSION ENDED REQUEST
// ─────────────────────────────────────────────────────────────────────────────

describe('SessionEndedRequest', () => {
  it('devuelve GOODBYE con sesión cerrada', async () => {
    const req = makeRequest({
      version: '1.0',
      request: { type: 'SessionEndedRequest', requestId: 'r1', timestamp: freshTimestamp(), locale: 'es-ES' },
    });
    const body = await parseBody(await POST(req));
    expect(body.response.outputSpeech.text).toContain('Hasta luego');
    expect(body.response.shouldEndSession).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. INTENTS DE SISTEMA
// ─────────────────────────────────────────────────────────────────────────────

describe('intents de sistema', () => {
  it('AMAZON.StopIntent → GOODBYE', async () => {
    const body = await parseBody(await POST(makeIntent('AMAZON.StopIntent')));
    expect(body.response.outputSpeech.text).toContain('Hasta luego');
    expect(body.response.shouldEndSession).toBe(true);
  });

  it('AMAZON.CancelIntent → GOODBYE', async () => {
    const body = await parseBody(await POST(makeIntent('AMAZON.CancelIntent')));
    expect(body.response.shouldEndSession).toBe(true);
  });

  it('AMAZON.HelpIntent → texto de ayuda, sesión abierta', async () => {
    const body = await parseBody(await POST(makeIntent('AMAZON.HelpIntent')));
    expect(body.response.outputSpeech.text).toContain('nook lista');
    expect(body.response.shouldEndSession).toBe(false);
    expect(body.response.reprompt).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. INTENTS DIRECTOS — NUNCA llaman a Claude
// ─────────────────────────────────────────────────────────────────────────────

describe('intents directos (sin slot, sin Claude)', () => {
  it('ResumenIntent → llama fallback("resumen"), nunca Claude', async () => {
    mockFallback.mockResolvedValueOnce({ handled: true, response: 'Resumen: todo OK.' });
    await POST(makeIntent('ResumenIntent'));
    expect(mockFallback).toHaveBeenCalledWith('resumen');
    expect(mockClaude).not.toHaveBeenCalled();
  });

  it('ListaComprasIntent → llama fallback("lista de compras"), nunca Claude', async () => {
    mockFallback.mockResolvedValueOnce({ handled: true, response: 'Lista: Leche, Pan.' });
    await POST(makeIntent('ListaComprasIntent'));
    expect(mockFallback).toHaveBeenCalledWith('lista de compras');
    expect(mockClaude).not.toHaveBeenCalled();
  });

  it('PrestamosIntent → llama fallback("préstamos"), nunca Claude', async () => {
    mockFallback.mockResolvedValueOnce({ handled: true, response: '2 préstamos activos.' });
    await POST(makeIntent('PrestamosIntent'));
    expect(mockFallback).toHaveBeenCalledWith('préstamos');
    expect(mockClaude).not.toHaveBeenCalled();
  });

  it('AnadirCompraIntent → llama fallback("apunta <item>"), nunca Claude', async () => {
    mockFallback.mockResolvedValueOnce({ handled: true, response: '"Jabón" añadido a la lista de compras.' });
    const req = makeIntent('AnadirCompraIntent');
    // Reconstruimos con slot "item" en lugar de "consulta"
    const body = {
      version: '1.0',
      request: {
        type: 'IntentRequest',
        requestId: 'r1',
        timestamp: freshTimestamp(),
        locale: 'es-ES',
        intent: {
          name: 'AnadirCompraIntent',
          confirmationStatus: 'NONE',
          slots: { item: { name: 'item', value: 'jabón', confirmationStatus: 'NONE' } },
        },
      },
    };
    const response = await parseBody(await POST(new NextRequest('http://localhost/api/alexa', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })));
    expect(mockFallback).toHaveBeenCalledWith('apunta jabón');
    expect(mockClaude).not.toHaveBeenCalled();
    expect(response.response.outputSpeech.text).toContain('Jabón');
  });

  it('AnadirCompraIntent sin slot → NO_QUERY', async () => {
    const body = {
      version: '1.0',
      request: {
        type: 'IntentRequest',
        requestId: 'r1',
        timestamp: freshTimestamp(),
        locale: 'es-ES',
        intent: { name: 'AnadirCompraIntent', confirmationStatus: 'NONE', slots: {} },
      },
    };
    const response = await parseBody(await POST(new NextRequest('http://localhost/api/alexa', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })));
    expect(response.response.outputSpeech.text).toContain('ayudarte');
    expect(mockClaude).not.toHaveBeenCalled();
  });

  it('ResumenIntent con fallback.handled=true → respuesta con reprompt', async () => {
    mockFallback.mockResolvedValueOnce({ handled: true, response: 'Todo en orden.' });
    const body = await parseBody(await POST(makeIntent('ResumenIntent')));
    expect(body.response.outputSpeech.text).toContain('Todo en orden');
    expect(body.response.reprompt).toBeDefined();
    expect(body.response.shouldEndSession).toBe(false);
  });

  it('ResumenIntent con fallback.handled=false → ERROR (sin Claude)', async () => {
    mockFallback.mockResolvedValueOnce({ handled: false });
    const body = await parseBody(await POST(makeIntent('ResumenIntent')));
    expect(body.response.outputSpeech.text).toContain('error');
    expect(mockClaude).not.toHaveBeenCalled();
  });

  it('ResumenIntent con fallback que lanza → ERROR (sin Claude)', async () => {
    mockFallback.mockRejectedValueOnce(new Error('DB down'));
    const body = await parseBody(await POST(makeIntent('ResumenIntent')));
    expect(body.response.outputSpeech.text).toContain('error');
    expect(mockClaude).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. ASISTENTE INTENT — flujo fallback → Claude
// ─────────────────────────────────────────────────────────────────────────────

describe('AsistenteIntent', () => {
  it('slot vacío → NO_QUERY (sesión abierta)', async () => {
    const body = await parseBody(await POST(makeIntent('AsistenteIntent', '')));
    expect(body.response.outputSpeech.text).toContain('ayudarte');
    expect(body.response.shouldEndSession).toBe(false);
    expect(mockFallback).not.toHaveBeenCalled();
    expect(mockClaude).not.toHaveBeenCalled();
  });

  it('slot con valor y fallback resuelve → respuesta con reprompt, sin Claude', async () => {
    mockFallback.mockResolvedValueOnce({ handled: true, response: 'Tienes 3 cosas en la lista.' });
    const body = await parseBody(
      await POST(makeIntent('AsistenteIntent', 'que tengo en la lista de compras')),
    );
    expect(mockClaude).not.toHaveBeenCalled();
    expect(body.response.outputSpeech.text).toContain('Tienes 3 cosas');
    expect(body.response.reprompt).toBeDefined();
  });

  it('fallback no resuelve → Claude llamado con la utterance correcta', async () => {
    mockFallback.mockResolvedValueOnce({ handled: false });
    await POST(makeIntent('AsistenteIntent', 'explícame qué tiempo hace'));
    expect(mockClaude).toHaveBeenCalledWith('explícame qué tiempo hace');
  });

  it('Claude resuelve → respuesta con reprompt', async () => {
    mockFallback.mockResolvedValueOnce({ handled: false });
    mockClaude.mockResolvedValueOnce('El tiempo está despejado.');
    const body = await parseBody(
      await POST(makeIntent('AsistenteIntent', 'qué tiempo hace')),
    );
    expect(body.response.outputSpeech.text).toContain('El tiempo');
    expect(body.response.reprompt).toBeDefined();
  });

  it('Claude lanza error de créditos → mensaje específico de Anthropic', async () => {
    mockFallback.mockResolvedValueOnce({ handled: false });
    mockClaude.mockRejectedValueOnce(new Error('Your credit balance is too low'));
    const body = await parseBody(
      await POST(makeIntent('AsistenteIntent', 'consulta cualquiera')),
    );
    expect(body.response.outputSpeech.text).toContain('créditos');
    expect(body.response.outputSpeech.text).toContain('Anthropic');
  });

  it('Claude lanza error genérico → respuesta de ERROR genérico', async () => {
    mockFallback.mockResolvedValueOnce({ handled: false });
    mockClaude.mockRejectedValueOnce(new Error('Connection timeout'));
    const body = await parseBody(
      await POST(makeIntent('AsistenteIntent', 'algo cualquiera')),
    );
    expect(body.response.outputSpeech.text).toContain('error');
    // No debe mencionar Anthropic ni créditos
    expect(body.response.outputSpeech.text).not.toContain('Anthropic');
  });

  it('fallback lanza excepción → Claude sigue siendo llamado', async () => {
    mockFallback.mockRejectedValueOnce(new Error('DB timeout'));
    mockClaude.mockResolvedValueOnce('Aquí la respuesta de Claude.');
    const body = await parseBody(
      await POST(makeIntent('AsistenteIntent', 'dónde están mis llaves')),
    );
    expect(mockClaude).toHaveBeenCalled();
    expect(body.response.outputSpeech.text).toContain('Claude');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. ELIMINAR COMPRA INTENT
// ─────────────────────────────────────────────────────────────────────────────

describe('EliminarCompraIntent', () => {
  function makeEliminarIntent(itemValue?: string) {
    const body = {
      version: '1.0',
      request: {
        type: 'IntentRequest',
        requestId: 'r1',
        timestamp: freshTimestamp(),
        locale: 'es-ES',
        intent: {
          name: 'EliminarCompraIntent',
          confirmationStatus: 'NONE',
          slots: itemValue !== undefined
            ? { item: { name: 'item', value: itemValue, confirmationStatus: 'NONE' } }
            : {},
        },
      },
    };
    return new NextRequest('http://localhost/api/alexa', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  it('llama fallback("borra <item>"), nunca Claude', async () => {
    mockFallback.mockResolvedValueOnce({ handled: true, response: '"Leche" eliminado de la lista.' });
    await POST(makeEliminarIntent('leche'));
    expect(mockFallback).toHaveBeenCalledWith('borra leche');
    expect(mockClaude).not.toHaveBeenCalled();
  });

  it('fallback resuelve → respuesta con reprompt', async () => {
    mockFallback.mockResolvedValueOnce({ handled: true, response: '"Pan" eliminado de la lista.' });
    const body = await parseBody(await POST(makeEliminarIntent('pan')));
    expect(body.response.outputSpeech.text).toContain('Pan');
    expect(body.response.reprompt).toBeDefined();
  });

  it('slot vacío → NO_QUERY', async () => {
    const body = await parseBody(await POST(makeEliminarIntent()));
    expect(body.response.outputSpeech.text).toContain('ayudarte');
    expect(mockClaude).not.toHaveBeenCalled();
  });

  it('fallback no resuelve → ERROR', async () => {
    mockFallback.mockResolvedValueOnce({ handled: false });
    const body = await parseBody(await POST(makeEliminarIntent('xyz')));
    expect(body.response.outputSpeech.text).toContain('error');
    expect(mockClaude).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. CAMBIAR CANTIDAD INTENT
// ─────────────────────────────────────────────────────────────────────────────

describe('CambiarCantidadIntent', () => {
  function makeCambiarIntent(consultaValue?: string) {
    const body = {
      version: '1.0',
      request: {
        type: 'IntentRequest',
        requestId: 'r1',
        timestamp: freshTimestamp(),
        locale: 'es-ES',
        intent: {
          name: 'CambiarCantidadIntent',
          confirmationStatus: 'NONE',
          slots: consultaValue !== undefined
            ? { consulta: { name: 'consulta', value: consultaValue, confirmationStatus: 'NONE' } }
            : {},
        },
      },
    };
    return new NextRequest('http://localhost/api/alexa', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  it('llama fallback("actualiza <consulta>"), nunca Claude', async () => {
    mockFallback.mockResolvedValueOnce({ handled: true, response: 'Cantidad de "Leche" actualizada a 3.' });
    await POST(makeCambiarIntent('leche a 3'));
    expect(mockFallback).toHaveBeenCalledWith('actualiza leche a 3');
    expect(mockClaude).not.toHaveBeenCalled();
  });

  it('fallback resuelve → respuesta con reprompt', async () => {
    mockFallback.mockResolvedValueOnce({ handled: true, response: 'Cantidad de "Café" actualizada a 2.' });
    const body = await parseBody(await POST(makeCambiarIntent('café a 2')));
    expect(body.response.outputSpeech.text).toContain('Café');
    expect(body.response.reprompt).toBeDefined();
  });

  it('slot vacío → NO_QUERY', async () => {
    const body = await parseBody(await POST(makeCambiarIntent()));
    expect(body.response.outputSpeech.text).toContain('ayudarte');
    expect(mockClaude).not.toHaveBeenCalled();
  });

  it('fallback no resuelve → mensaje de ayuda con ejemplo (no ERROR genérico)', async () => {
    mockFallback.mockResolvedValueOnce({ handled: false });
    const body = await parseBody(await POST(makeCambiarIntent('algo raro')));
    expect(body.response.outputSpeech.text).toContain('nook cambia');
    expect(mockClaude).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. EDGE CASES
// ─────────────────────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('intent desconocido sin slot → NO_QUERY (pregunta al usuario)', async () => {
    // Un intent desconocido sin slot "consulta" cae en el bloque !utterance → NO_QUERY
    const body = await parseBody(await POST(makeIntent('MiIntentInventado')));
    expect(body.response.outputSpeech.text).toContain('ayudarte');
    expect(body.response.shouldEndSession).toBe(false);
  });

  it('body JSON inválido → ERROR (catch global, 200 con error body)', async () => {
    const req = new NextRequest('http://localhost/api/alexa', {
      method: 'POST',
      body: 'esto no es json {{{{',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    // Puede ser 200 (el catch devuelve NextResponse.json(ERROR) sin status)
    const body = await parseBody(res);
    expect(body.response.outputSpeech.text).toContain('error');
  });

  it('ninguna respuesta incluye shouldEndSession:true salvo GOODBYE', async () => {
    // WELCOME
    const launchReq = makeRequest({
      version: '1.0',
      request: { type: 'LaunchRequest', requestId: 'r1', timestamp: freshTimestamp(), locale: 'es-ES' },
    });
    const launchBody = await parseBody(await POST(launchReq));
    expect(launchBody.response.shouldEndSession).toBe(false);

    // AsistenteIntent respondido
    mockFallback.mockResolvedValueOnce({ handled: true, response: 'Todo OK.' });
    const intentBody = await parseBody(
      await POST(makeIntent('AsistenteIntent', 'lista de compras')),
    );
    expect(intentBody.response.shouldEndSession).toBe(false);
  });
});
