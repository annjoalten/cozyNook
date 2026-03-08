/**
 * Fallback sin IA: detecta intenciones simples por palabras clave
 * y ejecuta la acción directamente contra Supabase.
 *
 * Se activa cuando la API de Anthropic no está disponible.
 */

import { getSupabaseAdmin } from '../supabase/admin';

type FallbackResult =
  | { handled: true; response: string }
  | { handled: false };

export async function handleWithFallback(utterance: string): Promise<FallbackResult> {
  const text = utterance.toLowerCase().trim();
  const supabase = getSupabaseAdmin();

  // ── Lista de compras ──────────────────────────────────────────────────────

  if (
    text.includes('lista de compras') ||
    text.includes('qué me falta') ||
    text.includes('que me falta') ||
    text.includes('qué tengo que comprar') ||
    text.includes('que tengo que comprar') ||
    text.includes('qué hay en la lista') ||
    text.includes('que hay en la lista')
  ) {
    const { data } = await supabase
      .from('shopping_list')
      .select('custom_name, quantity_needed, item:items(name)')
      .eq('checked', false)
      .order('created_at', { ascending: false });

    if (!data || data.length === 0) {
      return { handled: true, response: 'Tu lista de compras está vacía.' };
    }

    const nombres = data
      .slice(0, 5)
      .map((e) => e.custom_name ?? (e.item as { name: string } | null)?.name)
      .filter(Boolean)
      .join(', ');

    const total = data.length;
    const sufijo = total > 5 ? ` y ${total - 5} más` : '';
    return {
      handled: true,
      response: `Tienes ${total} ${total === 1 ? 'cosa' : 'cosas'} en la lista: ${nombres}${sufijo}.`,
    };
  }

  // ── Añadir a lista de compras ─────────────────────────────────────────────

  const addMatch =
    text.match(/^(?:añade|agrega|apunta|pon)\s+(.+?)\s+(?:a la lista|en la lista|a compras?)$/) ??
    text.match(/^(?:necesito|comprar|me falta|falta)\s+(.+)$/);

  if (addMatch) {
    const nombre = capitalize(addMatch[1].trim());
    const { error } = await supabase
      .from('shopping_list')
      .insert({ custom_name: nombre, quantity_needed: 1, note: null });

    if (error) {
      return { handled: true, response: `No pude añadir "${nombre}" a la lista.` };
    }
    return { handled: true, response: `"${nombre}" añadido a la lista de compras.` };
  }

  // ── Marcar como comprado ──────────────────────────────────────────────────

  const boughtMatch = text.match(
    /^(?:ya compr[eé]|compr[eé]|tacha|marca como comprado)\s+(.+)$/,
  );

  if (boughtMatch) {
    const nombre = boughtMatch[1].trim();
    const { data } = await supabase
      .from('shopping_list')
      .select('id, custom_name')
      .eq('checked', false)
      .ilike('custom_name', `%${nombre}%`)
      .limit(1);

    if (!data || data.length === 0) {
      return { handled: true, response: `No encontré "${nombre}" en la lista de compras pendiente.` };
    }

    await supabase
      .from('shopping_list')
      .update({ checked: true, checked_at: new Date().toISOString() })
      .eq('id', data[0].id);

    return { handled: true, response: `"${data[0].custom_name}" marcado como comprado.` };
  }

  // ── Préstamos activos ─────────────────────────────────────────────────────

  if (
    text.includes('préstamo') ||
    text.includes('prestamo') ||
    text.includes('prestado') ||
    text.includes('quién tiene') ||
    text.includes('quien tiene')
  ) {
    const { data } = await supabase
      .from('loans')
      .select('lent_to, item:items(name)')
      .is('returned_at', null)
      .order('lent_at', { ascending: false });

    if (!data || data.length === 0) {
      return { handled: true, response: 'No tienes préstamos activos.' };
    }

    const lista = data
      .slice(0, 3)
      .map((l) => `${(l.item as { name: string } | null)?.name ?? 'objeto'} a ${l.lent_to}`)
      .join(', ');

    const total = data.length;
    const sufijo = total > 3 ? ` y ${total - 3} más` : '';
    return {
      handled: true,
      response: `Tienes ${total} ${total === 1 ? 'préstamo activo' : 'préstamos activos'}: ${lista}${sufijo}.`,
    };
  }

  // ── Resumen ───────────────────────────────────────────────────────────────

  if (
    text.includes('resumen') ||
    text === 'cómo está la casa' ||
    text === 'como esta la casa' ||
    text.includes('estado de la casa')
  ) {
    const [listaResult, prestamosResult] = await Promise.all([
      supabase.from('shopping_list').select('id', { count: 'exact' }).eq('checked', false),
      supabase.from('loans').select('id', { count: 'exact' }).is('returned_at', null),
    ]);

    const compras = listaResult.count ?? 0;
    const prestamos = prestamosResult.count ?? 0;

    const partes: string[] = [];
    if (compras > 0) partes.push(`${compras} ${compras === 1 ? 'cosa' : 'cosas'} en la lista de compras`);
    if (prestamos > 0) partes.push(`${prestamos} ${prestamos === 1 ? 'préstamo activo' : 'préstamos activos'}`);

    if (partes.length === 0) {
      return { handled: true, response: 'Todo en orden. Lista de compras vacía y sin préstamos activos.' };
    }

    return {
      handled: true,
      response: `Resumen rápido: tienes ${partes.join(' y ')}. Para más detalles necesito conexión con la IA.`,
    };
  }

  return { handled: false };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
