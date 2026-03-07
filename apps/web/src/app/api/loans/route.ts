import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';

const createSchema = z.object({
  item_id: z.string().uuid(),
  lent_to: z.string().min(1).max(200),
  note: z.string().max(300).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const item_id = searchParams.get('item_id');

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('loans')
      .select('*, item:items(id, name)')
      .order('lent_at', { ascending: false });

    if (item_id) {
      query = query.eq('item_id', item_id);
    } else {
      query = query.is('returned_at', null);
    }

    const { data, error } = await query;

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
      .from('loans')
      .insert({
        item_id: parsed.data.item_id,
        lent_to: parsed.data.lent_to,
        note: parsed.data.note ?? null,
      })
      .select('*, item:items(id, name)')
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
