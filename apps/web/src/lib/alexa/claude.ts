import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '../supabase/admin';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

// ─── Tools que Claude puede invocar ─────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'buscar_items',
    description:
      'Busca items en el inventario del hogar por nombre, descripción, categoría o etiquetas. Usa esta herramienta cuando el usuario pregunte dónde está algo o si tiene algo.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Término de búsqueda (nombre, tipo de objeto, categoría...)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'obtener_lista_compra',
    description:
      'Obtiene los items pendientes de la lista de compras. Usa esta herramienta cuando el usuario quiera saber qué tiene que comprar.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'anadir_lista_compra',
    description:
      'Añade un producto a la lista de compras. Usa esta herramienta cuando el usuario diga que tiene que comprar algo o que le falta algo.',
    input_schema: {
      type: 'object' as const,
      properties: {
        nombre: {
          type: 'string',
          description: 'Nombre del producto a añadir',
        },
        cantidad: {
          type: 'number',
          description: 'Cantidad necesaria (por defecto 1)',
        },
        nota: {
          type: 'string',
          description: 'Nota opcional (marca, tamaño, etc.)',
        },
      },
      required: ['nombre'],
    },
  },
  {
    name: 'marcar_comprado',
    description:
      'Marca un producto de la lista de compras como comprado. Úsala cuando el usuario diga "ya compré X" o "tacha X de la lista".',
    input_schema: {
      type: 'object' as const,
      properties: {
        nombre: {
          type: 'string',
          description: 'Nombre del producto a marcar como comprado',
        },
      },
      required: ['nombre'],
    },
  },
  {
    name: 'quitar_lista_compra',
    description:
      'Elimina un producto de la lista de compras. Úsala cuando el usuario diga "quita X de la lista" o "borra X de la lista de compras".',
    input_schema: {
      type: 'object' as const,
      properties: {
        nombre: {
          type: 'string',
          description: 'Nombre del producto a eliminar',
        },
      },
      required: ['nombre'],
    },
  },
  {
    name: 'ver_prestamos',
    description:
      'Muestra los préstamos activos: objetos que el usuario ha prestado a otras personas y que aún no han sido devueltos.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'registrar_prestamo',
    description:
      'Registra que el usuario ha prestado un objeto a alguien. Busca el objeto en el inventario por nombre y crea el préstamo.',
    input_schema: {
      type: 'object' as const,
      properties: {
        item_nombre: {
          type: 'string',
          description: 'Nombre del objeto prestado',
        },
        persona: {
          type: 'string',
          description: 'Nombre de la persona a quien se presta',
        },
        nota: {
          type: 'string',
          description: 'Nota opcional sobre el préstamo',
        },
      },
      required: ['item_nombre', 'persona'],
    },
  },
  {
    name: 'devolver_prestamo',
    description:
      'Registra que un objeto prestado ha sido devuelto. Úsala cuando el usuario diga "X devolvió Y" o "me devolvieron X".',
    input_schema: {
      type: 'object' as const,
      properties: {
        item_nombre: {
          type: 'string',
          description: 'Nombre del objeto devuelto',
        },
        persona: {
          type: 'string',
          description: 'Nombre de la persona que devuelve (opcional, ayuda a identificar el préstamo correcto)',
        },
      },
      required: ['item_nombre'],
    },
  },
  {
    name: 'ver_items_habitacion',
    description:
      'Lista todos los objetos de una habitación concreta. Usa esta herramienta cuando el usuario pregunte qué hay en una habitación.',
    input_schema: {
      type: 'object' as const,
      properties: {
        habitacion: {
          type: 'string',
          description: 'Nombre de la habitación (cocina, salón, dormitorio, baño...)',
        },
      },
      required: ['habitacion'],
    },
  },
  {
    name: 'actualizar_stock',
    description:
      'Actualiza la cantidad de stock de un item. Úsala cuando el usuario diga "abrí X", "gasté X", "me queda poco de X" o "compré X unidades de Y".',
    input_schema: {
      type: 'object' as const,
      properties: {
        item_nombre: {
          type: 'string',
          description: 'Nombre del item cuyo stock se actualiza',
        },
        cantidad: {
          type: 'number',
          description: 'Nueva cantidad. Si el usuario dice "gasté 2", resta 2 del stock actual. Si dice "compré 3", suma 3.',
        },
        operacion: {
          type: 'string',
          enum: ['set', 'add', 'subtract'],
          description: '"set" para fijar cantidad exacta, "add" para añadir, "subtract" para restar',
        },
      },
      required: ['item_nombre', 'cantidad', 'operacion'],
    },
  },
  {
    name: 'resumen_casa',
    description:
      'Da un resumen general del estado de la casa: cuántas cosas hay en la lista de compras, préstamos activos e items con stock bajo. Úsala cuando el usuario pida "el resumen", "cómo está la casa" o similar.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'anadir_item_inventario',
    description:
      'Añade un nuevo objeto al inventario del hogar. Úsala cuando el usuario diga "añade X al inventario", "guarda X en Y" o "tengo un/una X en Y".',
    input_schema: {
      type: 'object' as const,
      properties: {
        nombre: {
          type: 'string',
          description: 'Nombre del objeto',
        },
        habitacion: {
          type: 'string',
          description: 'Habitación donde está guardado (cocina, salón, dormitorio...)',
        },
        lugar: {
          type: 'string',
          description: 'Lugar concreto dentro de la habitación (cajón, estantería, armario...)',
        },
        categoria: {
          type: 'string',
          description: 'Categoría del objeto (herramienta, electrodoméstico, ropa, libro...)',
        },
      },
      required: ['nombre', 'habitacion'],
    },
  },
];

// ─── Ejecución de herramientas ────────────────────────────────────────────────

async function executeTool(
  name: string,
  input: Record<string, unknown>,
): Promise<string> {
  const supabase = getSupabaseAdmin();

  switch (name) {
    case 'buscar_items': {
      const query = input.query as string;
      const { data } = await supabase
        .from('items')
        .select('name, room, spot, description, category, tags')
        .or(
          `name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,room.ilike.%${query}%`,
        )
        .limit(5);

      if (!data || data.length === 0) {
        return `No encontré ningún objeto relacionado con "${query}" en el inventario.`;
      }

      return JSON.stringify(
        data.map((item) => ({
          nombre: item.name,
          habitacion: item.room,
          lugar: item.spot,
          descripcion: item.description,
          categoria: item.category,
        })),
      );
    }

    case 'obtener_lista_compra': {
      const { data } = await supabase
        .from('shopping_list')
        .select('*, item:items(name)')
        .eq('checked', false)
        .order('created_at', { ascending: false });

      if (!data || data.length === 0) {
        return 'La lista de compras está vacía.';
      }

      return JSON.stringify(
        data.map((entry) => ({
          id: entry.id,
          nombre: entry.custom_name ?? (entry.item as unknown as { name: string } | null)?.name,
          cantidad: entry.quantity_needed,
          nota: entry.note,
        })),
      );
    }

    case 'anadir_lista_compra': {
      const nombre = input.nombre as string;
      const cantidad = (input.cantidad as number | undefined) ?? 1;
      const nota = (input.nota as string | undefined) ?? null;

      const { error } = await supabase.from('shopping_list').insert({
        custom_name: nombre,
        quantity_needed: cantidad,
        note: nota,
      });

      if (error) return `Error al añadir "${nombre}" a la lista: ${error.message}`;
      return `"${nombre}" añadido correctamente a la lista de compras.`;
    }

    case 'marcar_comprado': {
      const nombre = input.nombre as string;

      const { data } = await supabase
        .from('shopping_list')
        .select('id, custom_name, item:items(name)')
        .eq('checked', false)
        .or(`custom_name.ilike.%${nombre}%`)
        .limit(1);

      if (!data || data.length === 0) {
        return `No encontré "${nombre}" en la lista de compras pendiente.`;
      }

      const { error } = await supabase
        .from('shopping_list')
        .update({ checked: true, checked_at: new Date().toISOString() })
        .eq('id', data[0].id);

      if (error) return `Error al marcar "${nombre}" como comprado: ${error.message}`;
      return `"${nombre}" marcado como comprado. ¡Perfecto!`;
    }

    case 'quitar_lista_compra': {
      const nombre = input.nombre as string;

      const { data } = await supabase
        .from('shopping_list')
        .select('id, custom_name')
        .or(`custom_name.ilike.%${nombre}%`)
        .limit(1);

      if (!data || data.length === 0) {
        return `No encontré "${nombre}" en la lista de compras.`;
      }

      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', data[0].id);

      if (error) return `Error al eliminar "${nombre}" de la lista: ${error.message}`;
      return `"${nombre}" eliminado de la lista de compras.`;
    }

    case 'ver_prestamos': {
      const { data } = await supabase
        .from('loans')
        .select('*, item:items(name)')
        .is('returned_at', null)
        .order('lent_at', { ascending: false });

      if (!data || data.length === 0) {
        return 'No tienes préstamos activos en este momento.';
      }

      return JSON.stringify(
        data.map((loan) => ({
          id: loan.id,
          objeto: (loan.item as unknown as { name: string } | null)?.name,
          prestado_a: loan.lent_to,
          fecha: loan.lent_at,
          nota: loan.note,
        })),
      );
    }

    case 'registrar_prestamo': {
      const item_nombre = input.item_nombre as string;
      const persona = input.persona as string;
      const nota = (input.nota as string | undefined) ?? null;

      const { data: items } = await supabase
        .from('items')
        .select('id, name')
        .ilike('name', `%${item_nombre}%`)
        .limit(1);

      if (!items || items.length === 0) {
        return `No encontré "${item_nombre}" en el inventario. Asegúrate de que el objeto está guardado en cozyNook.`;
      }

      const { error } = await supabase.from('loans').insert({
        item_id: items[0].id,
        lent_to: persona,
        note: nota,
      });

      if (error) return `Error al registrar el préstamo: ${error.message}`;
      return `Préstamo de "${items[0].name}" a ${persona} registrado correctamente.`;
    }

    case 'devolver_prestamo': {
      const item_nombre = input.item_nombre as string;
      const persona = (input.persona as string | undefined) ?? null;

      let query = supabase
        .from('loans')
        .select('id, lent_to, item:items(name)')
        .is('returned_at', null);

      if (persona) {
        query = query.ilike('lent_to', `%${persona}%`);
      }

      const { data: loans } = await query.limit(10);

      if (!loans || loans.length === 0) {
        return 'No encontré préstamos activos que coincidan.';
      }

      // Busca el préstamo que coincida con el nombre del item
      const match = loans.find((l) =>
        (l.item as unknown as { name: string } | null)?.name
          ?.toLowerCase()
          .includes(item_nombre.toLowerCase()),
      );

      if (!match) {
        return `No encontré un préstamo activo de "${item_nombre}"${persona ? ` a ${persona}` : ''}.`;
      }

      const { error } = await supabase
        .from('loans')
        .update({ returned_at: new Date().toISOString() })
        .eq('id', match.id);

      if (error) return `Error al registrar la devolución: ${error.message}`;
      const itemName = (match.item as unknown as { name: string } | null)?.name ?? item_nombre;
      return `"${itemName}" marcado como devuelto por ${match.lent_to}. `;
    }

    case 'ver_items_habitacion': {
      const habitacion = input.habitacion as string;
      const { data } = await supabase
        .from('items')
        .select('name, spot, category')
        .ilike('room', `%${habitacion}%`)
        .order('name', { ascending: true })
        .limit(10);

      if (!data || data.length === 0) {
        return `No encontré objetos en la habitación "${habitacion}".`;
      }

      return JSON.stringify(
        data.map((item) => ({
          nombre: item.name,
          lugar: item.spot,
          categoria: item.category,
        })),
      );
    }

    case 'actualizar_stock': {
      const item_nombre = input.item_nombre as string;
      const cantidad = input.cantidad as number;
      const operacion = input.operacion as 'set' | 'add' | 'subtract';

      const { data: items } = await supabase
        .from('items')
        .select('id, name, stock')
        .ilike('name', `%${item_nombre}%`)
        .limit(1);

      if (!items || items.length === 0) {
        return `No encontré "${item_nombre}" en el inventario.`;
      }

      const item = items[0];
      const stockActual = (item.stock as { quantity?: number } | null)?.quantity ?? 0;

      let nuevaCantidad: number;
      if (operacion === 'set') nuevaCantidad = cantidad;
      else if (operacion === 'add') nuevaCantidad = stockActual + cantidad;
      else nuevaCantidad = Math.max(0, stockActual - cantidad);

      const nuevoStock = {
        ...((item.stock as object) ?? { type: 'units' }),
        quantity: nuevaCantidad,
      };

      const { error } = await supabase
        .from('items')
        .update({ stock: nuevoStock })
        .eq('id', item.id);

      if (error) return `Error al actualizar el stock: ${error.message}`;
      return `Stock de "${item.name}" actualizado a ${nuevaCantidad} unidades.`;
    }

    case 'resumen_casa': {
      const [listaResult, prestamosResult, itemsResult] = await Promise.all([
        supabase.from('shopping_list').select('id', { count: 'exact' }).eq('checked', false),
        supabase.from('loans').select('id, lent_to, item:items(name)').is('returned_at', null),
        supabase.from('items').select('id, name, stock').not('stock', 'is', null),
      ]);

      const pendientesCompra = listaResult.count ?? 0;
      const prestamosActivos = prestamosResult.data ?? [];

      // Items con stock bajo (quantity <= 2)
      const stockBajo = (itemsResult.data ?? []).filter((item) => {
        const qty = (item.stock as { quantity?: number } | null)?.quantity;
        return qty !== undefined && qty <= 2;
      });

      return JSON.stringify({
        lista_compras_pendiente: pendientesCompra,
        prestamos_activos: prestamosActivos.length,
        detalle_prestamos: prestamosActivos.map((l) => ({
          objeto: (l.item as unknown as { name: string } | null)?.name,
          persona: l.lent_to,
        })),
        items_stock_bajo: stockBajo.map((i) => ({
          nombre: i.name,
          cantidad: (i.stock as { quantity?: number } | null)?.quantity,
        })),
      });
    }

    case 'anadir_item_inventario': {
      const nombre = input.nombre as string;
      const habitacion = input.habitacion as string;
      const lugar = (input.lugar as string | undefined) ?? '';
      const categoria = (input.categoria as string | undefined) ?? null;

      const { error } = await supabase.from('items').insert({
        name: nombre,
        room: habitacion,
        spot: lugar,
        category: categoria,
        tags: [],
      });

      if (error) return `Error al añadir "${nombre}" al inventario: ${error.message}`;
      return `"${nombre}" añadido al inventario en ${habitacion}${lugar ? `, ${lugar}` : ''}.`;
    }

    default:
      return 'Herramienta no reconocida.';
  }
}

// ─── Prompt del sistema ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres el asistente de voz de cozyNook, una app de gestión de inventario del hogar.

Ayudas a los usuarios a:
- Encontrar dónde están sus objetos en casa
- Gestionar su lista de compras (añadir, consultar, marcar comprado, quitar)
- Ver y registrar préstamos de objetos, y marcarlos como devueltos
- Actualizar el stock de productos
- Obtener un resumen del estado de la casa
- Añadir nuevos objetos al inventario

Reglas importantes:
- Responde SIEMPRE en español, de forma natural y amigable para ser leído en voz alta por Alexa
- Mantén las respuestas cortas y claras (máximo 2-3 frases)
- Usa las herramientas para acceder a datos reales antes de responder
- Si no encuentras algo exacto, busca con términos similares
- Si hay varios resultados, menciona los más relevantes (máximo 3)
- Para ubicaciones, di primero la habitación y luego el lugar concreto
- Para el resumen, menciona primero lo más urgente (stock bajo, préstamos antiguos)`;

// ─── Loop agéntico principal ──────────────────────────────────────────────────

export async function handleWithClaude(utterance: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: utterance },
  ];

  for (let i = 0; i < 5; i++) {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });

    if (response.stop_reason === 'end_turn') {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join(' ');
      return text || 'Lo siento, no pude procesar tu solicitud.';
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const result = await executeTool(
            block.name,
            block.input as Record<string, unknown>,
          );
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: result,
          });
        }
      }

      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    break;
  }

  return 'Lo siento, no pude completar tu solicitud. Inténtalo de nuevo.';
}
