import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';

const createSchema = z
  .object({
    item_id: z.string().uuid().optional(),
    custom_name: z.string().min(1).max(200).optional(),
    quantity_needed: z.number().int().min(1).default(1),
    note: z.string().max(300).optional(),
  })
  .refine((d) => d.item_id || d.custom_name, {
    message: 'Se requiere item_id o custom_name',
  });

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('shopping_list')
      .select('*, item:items(id, name, category, room, spot)')
      .order('checked', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.issues },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('shopping_list')
      .insert({
        item_id: parsed.data.item_id ?? null,
        custom_name: parsed.data.custom_name ?? null,
        quantity_needed: parsed.data.quantity_needed,
        note: parsed.data.note ?? null,
      })
      .select('*, item:items(id, name, category, room, spot)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}
