/**
 * Tests para handleWithFallback.
 *
 * Garantiza que el pattern matching sin IA resuelve correctamente todos los
 * escenarios definidos, devolviendo handled:true y la respuesta esperada,
 * y que las consultas fuera de cobertura devuelven handled:false (→ Claude).
 *
 * Supabase está mockeado para aislar la lógica de strings.
 * Cada suite configura los datos que necesita mediante configureMock().
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock configurable de Supabase ─────────────────────────────────────────────

type MockResponse = { data?: unknown[] | null; count?: number | null; error?: unknown };
type TableMap = Record<string, MockResponse | MockResponse[]>;

let mockTableData: TableMap = {};
let mockCallCount: Record<string, number> = {};

/** Construye un Proxy que encadena métodos de Supabase y resuelve como Promise. */
function makeChain(response: MockResponse) {
  return new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === 'then') return (resolve: (v: MockResponse) => void) => resolve(response);
        return () => makeChain(response);
      },
    },
  );
}

vi.mock('../../supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => {
      const entry = mockTableData[table];
      if (Array.isArray(entry)) {
        const count = mockCallCount[table] ?? 0;
        mockCallCount[table] = count + 1;
        return makeChain(entry[Math.min(count, entry.length - 1)]);
      }
      return makeChain(
        (entry as MockResponse | undefined) ?? { data: [], count: 0, error: null },
      );
    },
  }),
}));

function configureMock(tables: TableMap) {
  mockTableData = tables;
  mockCallCount = {};
}

import { handleWithFallback } from '../fallback';

// ─────────────────────────────────────────────────────────────────────────────
// 1. NORMALIZACIÓN (efectos sobre el routing, probados de forma indirecta)
// ─────────────────────────────────────────────────────────────────────────────

describe('normalización de utterances', () => {
  beforeEach(() =>
    configureMock({
      shopping_list: { data: [], count: 0, error: null },
      loans: { data: [], count: 0, error: null },
      items: { data: [], count: 0, error: null },
    }),
  );

  it('elimina cortesía: "oye resumen" → sección resumen', async () => {
    const r = await handleWithFallback('oye resumen');
    expect(r.handled).toBe(true);
  });

  it('elimina carrier "nook dime": "nook dime qué me falta" → lista', async () => {
    const r = await handleWithFallback('nook dime qué me falta');
    expect(r.handled).toBe(true);
  });

  it('elimina "por favor": "por favor, mis compras" → lista', async () => {
    const r = await handleWithFallback('por favor, mis compras');
    expect(r.handled).toBe(true);
  });

  it('"nook dime dónde está el taladro" → búsqueda', async () => {
    configureMock({ items: { data: [{ name: 'Taladro', room: 'Trastero', spot: null }], error: null } });
    const r = await handleWithFallback('nook dime dónde está el taladro');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('Taladro');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. RESUMEN DE CASA
// ─────────────────────────────────────────────────────────────────────────────

describe('resumen de casa', () => {
  it('todo en orden → respuesta vacía', async () => {
    configureMock({
      shopping_list: { data: [], count: 0, error: null },
      loans: { data: [], count: 0, error: null },
      items: { data: [], count: 0, error: null },
    });
    const r = await handleWithFallback('resumen');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('Todo en orden');
  });

  it('1 compra pendiente → singular "cosa"', async () => {
    configureMock({
      shopping_list: { data: [{ id: 1 }], count: 1, error: null },
      loans: { data: [], count: 0, error: null },
      items: { data: [], count: 0, error: null },
    });
    const r = await handleWithFallback('resumen');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('1 cosa por comprar');
  });

  it('3 compras pendientes → plural "cosas"', async () => {
    configureMock({
      shopping_list: { data: [], count: 3, error: null },
      loans: { data: [], count: 0, error: null },
      items: { data: [], count: 0, error: null },
    });
    const r = await handleWithFallback('resumen');
    if (r.handled) expect(r.response).toContain('3 cosas por comprar');
  });

  it('1 préstamo activo → singular', async () => {
    configureMock({
      shopping_list: { data: [], count: 0, error: null },
      loans: { data: [{ id: 1 }], count: 1, error: null },
      items: { data: [], count: 0, error: null },
    });
    const r = await handleWithFallback('resumen');
    if (r.handled) expect(r.response).toContain('1 préstamo activo');
  });

  it('2 préstamos activos → plural', async () => {
    configureMock({
      shopping_list: { data: [], count: 0, error: null },
      loans: { data: [], count: 2, error: null },
      items: { data: [], count: 0, error: null },
    });
    const r = await handleWithFallback('resumen');
    if (r.handled) expect(r.response).toContain('2 préstamos activos');
  });

  it('stock.quantity <= 2 cuenta como bajo', async () => {
    configureMock({
      shopping_list: { data: [], count: 0, error: null },
      loans: { data: [], count: 0, error: null },
      items: {
        data: [
          { id: 1, name: 'Leche', stock: { quantity: 1 } },
          { id: 2, name: 'Café', stock: { quantity: 2 } },
        ],
        count: 2,
        error: null,
      },
    });
    const r = await handleWithFallback('resumen');
    if (r.handled) expect(r.response).toContain('2 productos con stock bajo');
  });

  it('stock.quantity > 2 NO cuenta como bajo', async () => {
    configureMock({
      shopping_list: { data: [], count: 0, error: null },
      loans: { data: [], count: 0, error: null },
      items: { data: [{ id: 1, name: 'Aceite', stock: { quantity: 5 } }], count: 1, error: null },
    });
    const r = await handleWithFallback('resumen');
    if (r.handled) expect(r.response).toContain('Todo en orden');
  });

  it('stock null → ignorado (no cuenta como bajo)', async () => {
    configureMock({
      shopping_list: { data: [], count: 0, error: null },
      loans: { data: [], count: 0, error: null },
      items: { data: [{ id: 1, name: 'Tijeras', stock: null }], count: 1, error: null },
    });
    const r = await handleWithFallback('resumen');
    if (r.handled) expect(r.response).toContain('Todo en orden');
  });

  it('combinación: compras + préstamos + stock bajo', async () => {
    configureMock({
      shopping_list: { data: [], count: 2, error: null },
      loans: { data: [], count: 1, error: null },
      items: { data: [{ id: 1, name: 'Leche', stock: { quantity: 0 } }], count: 1, error: null },
    });
    const r = await handleWithFallback('resumen');
    if (r.handled) {
      expect(r.response).toContain('cosas por comprar');
      expect(r.response).toContain('préstamo');
      expect(r.response).toContain('stock bajo');
    }
  });

  it.each([
    'cómo está la casa',
    'como esta la casa',
    'estado de la casa',
    'novedades',
    'qué pasa',
    'que pasa',
  ])('variante "%s" activa el resumen', async (utterance) => {
    configureMock({
      shopping_list: { data: [], count: 0, error: null },
      loans: { data: [], count: 0, error: null },
      items: { data: [], count: 0, error: null },
    });
    const r = await handleWithFallback(utterance);
    expect(r.handled).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. LISTA DE COMPRAS — VER
// ─────────────────────────────────────────────────────────────────────────────

describe('lista de compras — ver', () => {
  it('lista vacía → mensaje específico', async () => {
    configureMock({ shopping_list: { data: [], count: 0, error: null } });
    const r = await handleWithFallback('lista de compras');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('vacía');
  });

  it('1 ítem → singular "cosa"', async () => {
    configureMock({
      shopping_list: { data: [{ custom_name: 'Leche', quantity_needed: 1, item: null }], count: 1, error: null },
    });
    const r = await handleWithFallback('lista de compras');
    if (r.handled) {
      expect(r.response).toContain('1 cosa');
      expect(r.response).toContain('Leche');
    }
  });

  it('5 ítems → plural "cosas", sin sufijo', async () => {
    const items = Array.from({ length: 5 }, (_, i) => ({
      custom_name: `Item${i + 1}`, quantity_needed: 1, item: null,
    }));
    configureMock({ shopping_list: { data: items, count: 5, error: null } });
    const r = await handleWithFallback('mis compras');
    if (r.handled) {
      expect(r.response).toContain('5 cosas');
      expect(r.response).not.toContain('más');
    }
  });

  it('7 ítems → muestra 5 y "y 2 más"', async () => {
    const items = Array.from({ length: 7 }, (_, i) => ({
      custom_name: `Producto${i + 1}`, quantity_needed: 1, item: null,
    }));
    configureMock({ shopping_list: { data: items, count: 7, error: null } });
    const r = await handleWithFallback('qué me falta');
    if (r.handled) {
      expect(r.response).toContain('7 cosas');
      expect(r.response).toContain('y 2 más');
    }
  });

  it('ítem con nombre vinculado (sin custom_name) → usa item.name', async () => {
    configureMock({
      shopping_list: {
        data: [{ custom_name: null, quantity_needed: 1, item: { name: 'Taladro' } }],
        count: 1, error: null,
      },
    });
    const r = await handleWithFallback('lista de compras');
    if (r.handled) expect(r.response).toContain('Taladro');
  });

  it.each([
    'lista de compras',
    'que tengo en la lista de compras',  // input real del JSON de Alexa
    'qué me falta',
    'que me falta',
    'mis compras',
    'compras',
    'qué hay en la lista',
    'que hay en la lista',
    'qué hay que comprar',
    'que hay que comprar',
  ])('utterance "%s" activa lista-ver', async (utterance) => {
    configureMock({ shopping_list: { data: [], count: 0, error: null } });
    const r = await handleWithFallback(utterance);
    expect(r.handled).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. LISTA DE COMPRAS — AÑADIR
// ─────────────────────────────────────────────────────────────────────────────

describe('lista de compras — añadir', () => {
  beforeEach(() => configureMock({ shopping_list: { data: null, error: null } }));

  it('"apunta leche" → añade "Leche"', async () => {
    const r = await handleWithFallback('apunta leche');
    expect(r.handled).toBe(true);
    if (r.handled) {
      expect(r.response).toContain('"Leche"');
      expect(r.response).toContain('añadido');
    }
  });

  it('"apunta comprar aceite" → elimina "comprar" del nombre', async () => {
    const r = await handleWithFallback('apunta comprar aceite');
    if (r.handled) expect(r.response).toContain('"Aceite"');
  });

  it('"anota vinagre a la lista" → añade "Vinagre"', async () => {
    const r = await handleWithFallback('anota vinagre a la lista');
    if (r.handled) expect(r.response).toContain('"Vinagre"');
  });

  it('"necesito sal" → añade "Sal"', async () => {
    const r = await handleWithFallback('necesito sal');
    if (r.handled) expect(r.response).toContain('"Sal"');
  });

  it('"comprar pan" → añade "Pan"', async () => {
    const r = await handleWithFallback('comprar pan');
    if (r.handled) expect(r.response).toContain('"Pan"');
  });

  it('"me falta café" → añade "Café"', async () => {
    const r = await handleWithFallback('me falta café');
    if (r.handled) expect(r.response).toContain('"Café"');
  });

  it('"falta papel de baño" → añade "Papel de baño"', async () => {
    const r = await handleWithFallback('falta papel de baño');
    if (r.handled) expect(r.response).toContain('"Papel de baño"');
  });

  it('"quiero azúcar" → añade "Azúcar"', async () => {
    const r = await handleWithFallback('quiero azúcar');
    if (r.handled) expect(r.response).toContain('"Azúcar"');
  });

  it('stripArticle: "apunta el aceite" → "Aceite" (sin artículo)', async () => {
    const r = await handleWithFallback('apunta el aceite');
    if (r.handled) {
      expect(r.response).toContain('"Aceite"');
      expect(r.response).not.toContain('"El aceite"');
    }
  });

  it('capitalize: primera letra en mayúscula', async () => {
    const r = await handleWithFallback('necesito detergente');
    if (r.handled) expect(r.response).toContain('"Detergente"');
  });

  it('Supabase error → respuesta de error sin throw', async () => {
    configureMock({ shopping_list: { data: null, error: { code: 'PGRST001', message: 'error' } } });
    const r = await handleWithFallback('apunta leche');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('No pude añadir');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. LISTA DE COMPRAS — MARCAR COMPRADO
// ─────────────────────────────────────────────────────────────────────────────

describe('lista de compras — marcar comprado', () => {
  it('"ya compré la leche" → marca por custom_name', async () => {
    configureMock({
      shopping_list: [
        // 1ª llamada: SELECT por ilike → encontrado
        { data: [{ id: 42, custom_name: 'Leche', item: null }], error: null },
        // 2ª llamada: UPDATE (también usa makeChain)
        { data: null, error: null },
      ],
    });
    const r = await handleWithFallback('ya compré la leche');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('marcado como comprado');
  });

  it('"tacha el pan de la lista" → extrae "pan" y marca', async () => {
    configureMock({
      shopping_list: [
        { data: [{ id: 7, custom_name: 'Pan', item: null }], error: null },
        { data: null, error: null },
      ],
    });
    const r = await handleWithFallback('tacha el pan de la lista');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('Pan');
  });

  it('"quita el café" → funciona', async () => {
    configureMock({
      shopping_list: [
        { data: [{ id: 3, custom_name: 'Café', item: null }], error: null },
        { data: null, error: null },
      ],
    });
    const r = await handleWithFallback('quita el café');
    expect(r.handled).toBe(true);
  });

  it('encontrado por item vinculado cuando no hay custom_name', async () => {
    configureMock({
      shopping_list: [
        // 1ª: ilike sobre custom_name → no encontrado
        { data: [], error: null },
        // 2ª: búsqueda por item vinculado
        { data: [{ id: 99, item: { name: 'Taladro' } }], error: null },
        // 3ª: UPDATE
        { data: null, error: null },
      ],
    });
    const r = await handleWithFallback('ya compré el taladro');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('Taladro');
  });

  it('no encontrado en ninguna lista → mensaje específico', async () => {
    configureMock({
      shopping_list: [
        { data: [], error: null },  // ilike: vacío
        { data: [], error: null },  // item vinculado: vacío
      ],
    });
    const r = await handleWithFallback('ya compré la leche');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('No encontré');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. LISTA DE COMPRAS — ELIMINAR
// ─────────────────────────────────────────────────────────────────────────────

describe('lista de compras — eliminar', () => {
  it('"borra leche" → elimina por custom_name', async () => {
    configureMock({
      shopping_list: [
        { data: [{ id: 5, custom_name: 'Leche', item: null }], error: null },
        { data: null, error: null }, // DELETE
      ],
    });
    const r = await handleWithFallback('borra leche');
    expect(r.handled).toBe(true);
    if (r.handled) {
      expect(r.response).toContain('"Leche"');
      expect(r.response).toContain('eliminado');
    }
  });

  it('"elimina la leche de la lista" → stripArticle + eliminado', async () => {
    configureMock({
      shopping_list: [
        { data: [{ id: 6, custom_name: 'Leche', item: null }], error: null },
        { data: null, error: null },
      ],
    });
    const r = await handleWithFallback('elimina la leche de la lista');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('eliminado');
  });

  it('encontrado por item vinculado cuando no hay custom_name', async () => {
    configureMock({
      shopping_list: [
        { data: [], error: null },                                           // ilike: no custom_name match
        { data: [{ id: 99, item: { name: 'Café' } }], error: null },        // linked item
        { data: null, error: null },                                         // DELETE
      ],
    });
    const r = await handleWithFallback('borra café');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('Café');
  });

  it('no encontrado → mensaje específico', async () => {
    configureMock({
      shopping_list: [
        { data: [], error: null },
        { data: [], error: null },
      ],
    });
    const r = await handleWithFallback('borra naranja');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('No encontré');
  });

  it.each(['borra leche', 'elimina pan', 'suprime aceite', 'retira sal de la lista', 'saca café'])(
    '"%s" activa eliminar', async (utterance) => {
      configureMock({
        shopping_list: [
          { data: [{ id: 1, custom_name: utterance.split(' ').pop()!, item: null }], error: null },
          { data: null, error: null },
        ],
      });
      const r = await handleWithFallback(utterance);
      expect(r.handled).toBe(true);
    },
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. LISTA DE COMPRAS — MODIFICAR CANTIDAD
// ─────────────────────────────────────────────────────────────────────────────

describe('lista de compras — modificar cantidad', () => {
  it('"actualiza leche a 3" → actualiza quantity_needed', async () => {
    configureMock({
      shopping_list: [
        { data: [{ id: 10, custom_name: 'Leche', item: null }], error: null },
        { data: null, error: null }, // UPDATE
      ],
    });
    const r = await handleWithFallback('actualiza leche a 3');
    expect(r.handled).toBe(true);
    if (r.handled) {
      expect(r.response).toContain('"Leche"');
      expect(r.response).toContain('3');
      expect(r.response).toContain('actualizada');
    }
  });

  it('"actualiza la leche a 2 unidades" → stripArticle funciona', async () => {
    configureMock({
      shopping_list: [
        { data: [{ id: 11, custom_name: 'Leche', item: null }], error: null },
        { data: null, error: null },
      ],
    });
    const r = await handleWithFallback('actualiza la leche a 2 unidades');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('2');
  });

  it('"actualiza 5 de café" → patrón cantidad-primero', async () => {
    configureMock({
      shopping_list: [
        { data: [{ id: 12, custom_name: 'Café', item: null }], error: null },
        { data: null, error: null },
      ],
    });
    const r = await handleWithFallback('actualiza 5 de café');
    expect(r.handled).toBe(true);
    if (r.handled) {
      expect(r.response).toContain('"Café"');
      expect(r.response).toContain('5');
    }
  });

  it('no encontrado en lista → mensaje específico', async () => {
    configureMock({ shopping_list: { data: [], error: null } });
    const r = await handleWithFallback('actualiza naranja a 4');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('No encontré');
  });

  it('cantidad = 0 → handled: false (cantidad inválida)', async () => {
    configureMock({ shopping_list: { data: [], error: null } });
    const r = await handleWithFallback('actualiza leche a 0');
    expect(r.handled).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. PRÉSTAMOS — VER
// ─────────────────────────────────────────────────────────────────────────────

describe('préstamos — ver', () => {
  it('sin préstamos activos', async () => {
    configureMock({ loans: { data: [], count: 0, error: null } });
    const r = await handleWithFallback('préstamos');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('No tienes préstamos');
  });

  it('1 préstamo → singular "préstamo activo"', async () => {
    configureMock({
      loans: {
        data: [{ lent_to: 'Carlos', lent_at: '2026-01-01', item: { name: 'Taladro' } }],
        count: 1, error: null,
      },
    });
    const r = await handleWithFallback('préstamos');
    if (r.handled) {
      expect(r.response).toContain('1 préstamo activo');
      expect(r.response).toContain('Taladro');
      expect(r.response).toContain('Carlos');
    }
  });

  it('3 préstamos → plural, sin sufijo', async () => {
    const loans = [
      { lent_to: 'Ana', lent_at: '2026-01-01', item: { name: 'Libro' } },
      { lent_to: 'Bob', lent_at: '2026-01-02', item: { name: 'DVD' } },
      { lent_to: 'Carmen', lent_at: '2026-01-03', item: { name: 'Taladro' } },
    ];
    configureMock({ loans: { data: loans, count: 3, error: null } });
    const r = await handleWithFallback('mis préstamos');
    if (r.handled) {
      expect(r.response).toContain('3 préstamos activos');
      expect(r.response).not.toContain('más');
    }
  });

  it('4 préstamos → muestra 3 y "y 1 más"', async () => {
    const loans = Array.from({ length: 4 }, (_, i) => ({
      lent_to: `Persona${i}`, lent_at: '2026-01-01', item: { name: `Item${i}` },
    }));
    configureMock({ loans: { data: loans, count: 4, error: null } });
    const r = await handleWithFallback('préstamos');
    if (r.handled) expect(r.response).toContain('y 1 más');
  });

  it('item sin nombre → fallback "objeto"', async () => {
    configureMock({
      loans: {
        data: [{ lent_to: 'Luis', lent_at: '2026-01-01', item: null }],
        count: 1, error: null,
      },
    });
    const r = await handleWithFallback('préstamos');
    if (r.handled) expect(r.response).toContain('objeto');
  });

  it.each(['préstamos', 'prestamos', 'qué he prestado', 'quién tiene'])(
    'variante "%s" activa préstamos', async (utterance) => {
      configureMock({ loans: { data: [], count: 0, error: null } });
      const r = await handleWithFallback(utterance);
      expect(r.handled).toBe(true);
    },
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. ITEMS EN HABITACIÓN
// ─────────────────────────────────────────────────────────────────────────────

describe('items en habitación', () => {
  it('"qué hay en la cocina" → lista de ítems', async () => {
    configureMock({
      items: {
        data: [{ name: 'Cafetera', spot: 'encimera' }, { name: 'Tostadora', spot: null }],
        error: null,
      },
    });
    const r = await handleWithFallback('qué hay en la cocina');
    expect(r.handled).toBe(true);
    if (r.handled) {
      expect(r.response).toContain('cocina');
      expect(r.response).toContain('Cafetera');
    }
  });

  it('"qué tengo en el baño" → activa por detectRoom', async () => {
    configureMock({ items: { data: [], error: null } });
    const r = await handleWithFallback('qué tengo en el baño');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('baño');
  });

  it('sin ítems en habitación → mensaje "no encontré objetos"', async () => {
    configureMock({ items: { data: [], error: null } });
    const r = await handleWithFallback('qué hay en el trastero');
    expect(r.handled).toBe(true);
    if (r.handled) expect(r.response).toContain('No encontré objetos');
  });

  it('1 ítem → singular "objeto"', async () => {
    configureMock({ items: { data: [{ name: 'Aspiradora', spot: null }], error: null } });
    const r = await handleWithFallback('qué hay en el salón');
    if (r.handled) expect(r.response).toContain('1 objeto');
  });

  it('detecta "salon" (sin tilde) como habitación válida', async () => {
    configureMock({ items: { data: [], error: null } });
    const r = await handleWithFallback('qué hay en el salon');
    expect(r.handled).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. BÚSQUEDA DE ITEM POR NOMBRE
// ─────────────────────────────────────────────────────────────────────────────

describe('búsqueda de item', () => {
  it('"dónde están mis llaves" → 1 resultado con spot', async () => {
    configureMock({
      items: { data: [{ name: 'Llaves', room: 'Entrada', spot: 'cajón derecho' }], error: null },
    });
    const r = await handleWithFallback('dónde están mis llaves');
    expect(r.handled).toBe(true);
    if (r.handled) {
      expect(r.response).toContain('Llaves');
      expect(r.response).toContain('Entrada');
      expect(r.response).toContain('cajón derecho');
    }
  });

  it('"dónde está el taladro" → 1 resultado sin spot', async () => {
    configureMock({
      items: { data: [{ name: 'Taladro', room: 'Trastero', spot: null }], error: null },
    });
    const r = await handleWithFallback('dónde está el taladro');
    if (r.handled) {
      expect(r.response).toContain('Taladro');
      expect(r.response).toContain('Trastero');
      expect(r.response).not.toContain('null');
    }
  });

  it('0 resultados → "No encontré" con mensaje de inventario', async () => {
    configureMock({ items: { data: [], error: null } });
    const r = await handleWithFallback('dónde está el gato');
    expect(r.handled).toBe(true);
    if (r.handled) {
      expect(r.response).toContain('No encontré');
      expect(r.response).toContain('gato');
    }
  });

  it('3 resultados → lista múltiple', async () => {
    configureMock({
      items: {
        data: [
          { name: 'Tijeras pequeñas', room: 'Cocina', spot: null },
          { name: 'Tijeras grandes', room: 'Estudio', spot: null },
          { name: 'Tijeras de cocina', room: 'Cocina', spot: 'cajón' },
        ],
        error: null,
      },
    });
    const r = await handleWithFallback('dónde están las tijeras');
    if (r.handled) {
      expect(r.response).toContain('3 coincidencias');
    }
  });

  it('acento alternativo: "donde esta" (sin tilde) → también funciona', async () => {
    configureMock({ items: { data: [], error: null } });
    const r = await handleWithFallback('donde esta el pasaporte');
    expect(r.handled).toBe(true);
  });

  it('"tienes tijeras" → activa búsqueda por "tienes"', async () => {
    configureMock({ items: { data: [], error: null } });
    const r = await handleWithFallback('tienes tijeras');
    expect(r.handled).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. CASOS QUE DEBEN IR A CLAUDE (handled: false)
// ─────────────────────────────────────────────────────────────────────────────

describe('casos fuera de cobertura → handled: false (→ Claude)', () => {
  it.each([
    'hola qué tal',
    'qué tiempo hace hoy',
    'cuánto cuesta la leche',
    'recuérdame llamar a mamá',
    'pon música relajante',
  ])('"%s" → handled: false', async (utterance) => {
    const r = await handleWithFallback(utterance);
    expect(r.handled).toBe(false);
  });
});
