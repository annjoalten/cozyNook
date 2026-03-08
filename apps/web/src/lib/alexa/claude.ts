import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '../supabase/admin';

const client = new Anthropic();

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
          nombre: entry.custom_name ?? (entry.item as { name: string } | null)?.name,
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
          objeto: (loan.item as { name: string } | null)?.name,
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

    default:
      return 'Herramienta no reconocida.';
  }
}

// ─── Prompt del sistema ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres el asistente de voz de cozyNook, una app de gestión de inventario del hogar.

Ayudas a los usuarios a:
- Encontrar dónde están sus objetos en casa
- Gestionar su lista de compras (añadir, consultar)
- Ver y registrar préstamos de objetos

Reglas importantes:
- Responde SIEMPRE en español, de forma natural y amigable para ser leído en voz alta por Alexa
- Mantén las respuestas cortas y claras (máximo 2-3 frases)
- Usa las herramientas para acceder a datos reales antes de responder
- Si no encuentras algo exacto, busca con términos similares
- Si hay varios resultados, menciona los más relevantes (máximo 3)
- Para ubicaciones, di primero la habitación y luego el lugar concreto`;

// ─── Loop agéntico principal ──────────────────────────────────────────────────

export async function handleWithClaude(utterance: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: utterance },
  ];

  for (let i = 0; i < 5; i++) {
    const response = await client.messages.create({
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
