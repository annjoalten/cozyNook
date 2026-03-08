/**
 * Fallback sin IA: detecta intenciones por palabras clave y ejecuta
 * directamente contra Supabase. Se ejecuta ANTES de llamar a Claude.
 */

import { getSupabaseAdmin } from '../supabase/admin';

type FallbackResult =
  | { handled: true; response: string }
  | { handled: false };

// ─── Normalización ────────────────────────────────────────────────────────────

const POLITENESS = /^(oye|por favor|a ver|eh|hola|buenas|venga|mira|oiga|perdona)[,\s]+/gi;
const CARRIER_PHRASES = /^(nook\s+)?(dime|busca|encuentra|apunta|lista|pregunta|consulta|di|muestra|muéstrame|dímelo|dime)\s+/i;
const ARTICLES = /^(el|la|los|las|un|una|unos|unas)\s+/i;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(POLITENESS, '')
    .replace(CARRIER_PHRASES, '')
    .trim();
}

function stripArticle(text: string): string {
  return text.replace(ARTICLES, '').trim();
}

// ─── Habitaciones conocidas ───────────────────────────────────────────────────

const ROOMS = [
  'cocina', 'salón', 'salon', 'comedor', 'dormitorio', 'habitación', 'habitacion',
  'cuarto', 'baño', 'bano', 'aseo', 'trastero', 'entrada', 'pasillo', 'garaje',
  'terraza', 'balcón', 'balcon', 'estudio', 'despacho', 'lavandería', 'lavanderia',
  'jardín', 'jardin', 'sótano', 'sotano', 'ático', 'atico',
];

function detectRoom(text: string): string | null {
  return ROOMS.find((r) => text.includes(r)) ?? null;
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function handleWithFallback(utterance: string): Promise<FallbackResult> {
  const raw = utterance.toLowerCase().trim();
  const text = normalize(raw);
  const supabase = getSupabaseAdmin();

  // ── Resumen de casa ───────────────────────────────────────────────────────

  if (
    text.includes('resumen') ||
    text.includes('cómo está la casa') ||
    text.includes('como esta la casa') ||
    text.includes('estado de la casa') ||
    text.includes('novedades') ||
    text === 'qué pasa' ||
    text === 'que pasa'
  ) {
    const [listaResult, prestamosResult, stockResult] = await Promise.all([
      supabase.from('shopping_list').select('id', { count: 'exact' }).eq('checked', false),
      supabase.from('loans').select('id', { count: 'exact' }).is('returned_at', null),
      supabase.from('items').select('id, name, stock').not('stock', 'is', null),
    ]);

    const compras = listaResult.count ?? 0;
    const prestamos = prestamosResult.count ?? 0;
    const stockBajo = (stockResult.data ?? []).filter((i) => {
      const qty = (i.stock as { quantity?: number } | null)?.quantity;
      return qty !== undefined && qty <= 2;
    }).length;

    const partes: string[] = [];
    if (compras > 0) partes.push(`${compras} ${compras === 1 ? 'cosa' : 'cosas'} por comprar`);
    if (prestamos > 0) partes.push(`${prestamos} ${prestamos === 1 ? 'préstamo activo' : 'préstamos activos'}`);
    if (stockBajo > 0) partes.push(`${stockBajo} ${stockBajo === 1 ? 'producto con stock bajo' : 'productos con stock bajo'}`);

    if (partes.length === 0) {
      return { handled: true, response: 'Todo en orden. Lista vacía, sin préstamos y sin stock bajo.' };
    }
    return { handled: true, response: `Resumen: tienes ${partes.join(', ')}.` };
  }

  // ── Lista de compras — ver ────────────────────────────────────────────────

  if (
    text.includes('lista de compras') ||
    text.includes('lista compras') ||
    raw.includes('lista de compras') ||  // raw: evita que normalize() strips "lista" carrier phrase
    text.includes('qué me falta') ||
    text.includes('que me falta') ||
    text.includes('qué hay que comprar') ||
    text.includes('que hay que comprar') ||
    text.includes('qué tengo que comprar') ||
    text.includes('que tengo que comprar') ||
    text.includes('qué tengo en la lista') ||
    text.includes('que tengo en la lista') ||
    text.includes('qué hay en la lista') ||
    text.includes('que hay en la lista') ||
    text.includes('mis compras') ||
    text === 'compras' ||
    text === 'la lista'
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
      .map((e) => e.custom_name ?? (e.item as unknown as { name: string } | null)?.name)
      .filter(Boolean)
      .join(', ');

    const total = data.length;
    const sufijo = total > 5 ? ` y ${total - 5} más` : '';
    return {
      handled: true,
      response: `Tienes ${total} ${total === 1 ? 'cosa' : 'cosas'} en la lista: ${nombres}${sufijo}.`,
    };
  }

  // ── Lista de compras — añadir ─────────────────────────────────────────────

  const addMatch =
    // Primero en text (normalizado), por si no se strippeó el verbo
    text.match(/^(?:apunta|anota)\s+(?:comprar\s+)?(.+?)(?:\s+(?:a la lista|en la lista|a compras?))?$/) ??
    // raw: evita que normalize() strips "apunta/anota" carrier phrase
    raw.match(/^(?:apunta|anota)\s+(?:comprar\s+)?(.+?)(?:\s+(?:a la lista|en la lista|a compras?))?$/) ??
    text.match(/^(?:necesito|comprar|me falta|falta|quiero)\s+(.+)$/);

  if (addMatch) {
    const nombre = capitalize(stripArticle(addMatch[1].trim()));
    const { error } = await supabase
      .from('shopping_list')
      .insert({ custom_name: nombre, quantity_needed: 1, note: null });

    if (error) return { handled: true, response: `No pude añadir "${nombre}" a la lista.` };
    return { handled: true, response: `"${nombre}" añadido a la lista de compras.` };
  }

  // ── Lista de compras — marcar comprado ────────────────────────────────────

  const boughtMatch = text.match(
    /^(?:ya compr[eé]|compr[eé]|tacha|quita|tach[ao])\s+(.+?)(?:\s+de la lista)?$/,
  );

  if (boughtMatch) {
    const nombre = stripArticle(boughtMatch[1].trim());

    // Buscar en shopping_list (custom_name o item vinculado)
    const { data: listData } = await supabase
      .from('shopping_list')
      .select('id, custom_name, item:items(name)')
      .eq('checked', false)
      .ilike('custom_name', `%${nombre}%`)
      .limit(1);

    if (listData && listData.length > 0) {
      await supabase
        .from('shopping_list')
        .update({ checked: true, checked_at: new Date().toISOString() })
        .eq('id', listData[0].id);
      return { handled: true, response: `"${listData[0].custom_name}" marcado como comprado.` };
    }

    // Buscar por item vinculado en caso de que no haya custom_name
    const { data: itemLinked } = await supabase
      .from('shopping_list')
      .select('id, item:items(name)')
      .eq('checked', false)
      .limit(20);

    const match = itemLinked?.find((e) =>
      (e.item as unknown as { name: string } | null)?.name?.toLowerCase().includes(nombre),
    );

    if (match) {
      await supabase
        .from('shopping_list')
        .update({ checked: true, checked_at: new Date().toISOString() })
        .eq('id', match.id);
      const itemName = (match.item as unknown as { name: string } | null)?.name ?? nombre;
      return { handled: true, response: `"${itemName}" marcado como comprado.` };
    }

    return { handled: true, response: `No encontré "${nombre}" en la lista de compras pendiente.` };
  }

  // ── Lista de compras — eliminar ───────────────────────────────────────────

  const deleteMatch =
    text.match(/^(?:borra|elimina|suprime|retira|saca)\s+(.+?)(?:\s+de la lista)?$/) ??
    raw.match(/^(?:borra|elimina|suprime|retira|saca)\s+(.+?)(?:\s+de la lista)?$/);

  if (deleteMatch) {
    const nombre = stripArticle(deleteMatch[1].trim());

    const { data: listData } = await supabase
      .from('shopping_list')
      .select('id, custom_name, item:items(name)')
      .eq('checked', false)
      .ilike('custom_name', `%${nombre}%`)
      .limit(1);

    if (listData && listData.length > 0) {
      await supabase.from('shopping_list').delete().eq('id', listData[0].id);
      return { handled: true, response: `"${listData[0].custom_name}" eliminado de la lista.` };
    }

    const { data: itemLinked } = await supabase
      .from('shopping_list')
      .select('id, item:items(name)')
      .eq('checked', false)
      .limit(20);

    const deleteLinkedMatch = itemLinked?.find((e) =>
      (e.item as unknown as { name: string } | null)?.name?.toLowerCase().includes(nombre),
    );

    if (deleteLinkedMatch) {
      await supabase.from('shopping_list').delete().eq('id', deleteLinkedMatch.id);
      const itemName = (deleteLinkedMatch.item as unknown as { name: string } | null)?.name ?? nombre;
      return { handled: true, response: `"${itemName}" eliminado de la lista.` };
    }

    return { handled: true, response: `No encontré "${nombre}" en la lista de compras pendiente.` };
  }

  // ── Lista de compras — modificar cantidad ─────────────────────────────────
  // CambiarCantidadIntent prepend "actualiza " al slot antes de llamar al fallback

  const qtyNombreFirst =
    text.match(/^(?:actualiza|cambia)\s+(.+?)\s+a\s+(\d+)(?:\s+unidades?)?$/);
  const qtyCantidadFirst =
    text.match(/^(?:actualiza|cambia)\s+(\d+)(?:\s+unidades?)?\s+de\s+(.+)$/);

  if (qtyNombreFirst || qtyCantidadFirst) {
    const [nombre, cantidad] = qtyNombreFirst
      ? [stripArticle(qtyNombreFirst[1].trim()), parseInt(qtyNombreFirst[2])]
      : [stripArticle((qtyCantidadFirst as RegExpMatchArray)[2].trim()), parseInt((qtyCantidadFirst as RegExpMatchArray)[1])];

    if (isNaN(cantidad) || cantidad < 1) return { handled: false };

    const { data: listData } = await supabase
      .from('shopping_list')
      .select('id, custom_name, item:items(name)')
      .eq('checked', false)
      .ilike('custom_name', `%${nombre}%`)
      .limit(1);

    if (listData && listData.length > 0) {
      await supabase
        .from('shopping_list')
        .update({ quantity_needed: cantidad })
        .eq('id', listData[0].id);
      return {
        handled: true,
        response: `Cantidad de "${listData[0].custom_name}" actualizada a ${cantidad}.`,
      };
    }

    return { handled: true, response: `No encontré "${nombre}" en la lista de compras.` };
  }

  // ── Préstamos — ver ───────────────────────────────────────────────────────

  if (
    text.includes('préstamo') ||
    text.includes('prestamo') ||
    text.includes('prestado') ||
    text.includes('he prestado') ||
    text.includes('quién tiene') ||
    text.includes('quien tiene') ||
    text === 'préstamos' ||
    text === 'prestamos'
  ) {
    const { data } = await supabase
      .from('loans')
      .select('lent_to, lent_at, item:items(name)')
      .is('returned_at', null)
      .order('lent_at', { ascending: false });

    if (!data || data.length === 0) {
      return { handled: true, response: 'No tienes préstamos activos.' };
    }

    const lista = data
      .slice(0, 3)
      .map((l) => `${(l.item as unknown as { name: string } | null)?.name ?? 'objeto'} a ${l.lent_to}`)
      .join(', ');

    const total = data.length;
    const sufijo = total > 3 ? ` y ${total - 3} más` : '';
    return {
      handled: true,
      response: `Tienes ${total} ${total === 1 ? 'préstamo activo' : 'préstamos activos'}: ${lista}${sufijo}.`,
    };
  }

  // ── Items en habitación ───────────────────────────────────────────────────

  const roomInText = detectRoom(text);
  const roomQuery =
    text.match(/^(?:qué (?:hay|tengo) en|qué tiene|items? (?:de|en)|contenido de)\s+(?:el |la |los |las )?(.+)$/) ??
    text.match(/^(?:en|la|el)\s+(.+?)\s+(?:qué hay|qué tengo|items?)$/);

  if (roomInText || roomQuery) {
    const habitacion = roomInText ?? stripArticle((roomQuery?.[1] ?? '').trim());

    if (habitacion) {
      const { data } = await supabase
        .from('items')
        .select('name, spot')
        .ilike('room', `%${habitacion}%`)
        .order('name', { ascending: true })
        .limit(8);

      if (!data || data.length === 0) {
        return { handled: true, response: `No encontré objetos en ${habitacion}.` };
      }

      const nombres = data.map((i) => i.name).join(', ');
      const total = data.length;
      return {
        handled: true,
        response: `En ${habitacion} tienes ${total} ${total === 1 ? 'objeto' : 'objetos'}: ${nombres}.`,
      };
    }
  }

  // ── Buscar item por nombre ────────────────────────────────────────────────

  const searchMatch =
    text.match(/^(?:d[oó]nde est[áa]n?|busca|encuentra|tienes?|hay|localiza)\s+(?:el |la |los |las |un |una |unos |unas )?(.+)$/) ??
    text.match(/^(.+?)\s+d[oó]nde est[áa]n?$/);

  if (searchMatch) {
    const query = stripArticle(searchMatch[1].trim());

    if (query.length < 2) return { handled: false };

    const { data } = await supabase
      .from('items')
      .select('name, room, spot')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(3);

    if (!data || data.length === 0) {
      return {
        handled: true,
        response: `No encontré "${query}" en el inventario. Asegúrate de que esté guardado en cozyNook.`,
      };
    }

    if (data.length === 1) {
      const item = data[0];
      const ubicacion = item.spot ? `en ${item.room}, ${item.spot}` : `en ${item.room}`;
      return { handled: true, response: `${item.name} está ${ubicacion}.` };
    }

    const lista = data
      .map((i) => `${i.name} en ${i.room}${i.spot ? `, ${i.spot}` : ''}`)
      .join('. ');
    return { handled: true, response: `Encontré ${data.length} coincidencias: ${lista}.` };
  }

  return { handled: false };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
