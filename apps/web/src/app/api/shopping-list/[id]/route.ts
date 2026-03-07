import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const patchSchema = z
  .object({
    checked: z.boolean(),
    quantity_needed: z.number().int().min(1),
    note: z.string().max(300).nullable(),
  })
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'El patch no puede estar vacío',
  });

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.issues },
        { status: 400 },
      );
    }

    const payload: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.checked === true) {
      payload.checked_at = new Date().toISOString();
    } else if (parsed.data.checked === false) {
      payload.checked_at = null;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('shopping_list')
      .update(payload)
      .eq('id', id)
      .select('*, item:items(id, name, category, room, spot)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('shopping_list')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}
