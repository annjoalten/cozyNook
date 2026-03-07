import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';

interface RouteContext {
  params: Promise<{ item_id: string }>;
}

const putSchema = z.object({
  min_quantity: z.number().int().min(0),
  enabled: z.boolean().default(true),
});

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { item_id } = await context.params;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('stock_alerts')
      .select('*')
      .eq('item_id', item_id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(null);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { item_id } = await context.params;
    const body = await request.json().catch(() => null);
    const parsed = putSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.issues },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('stock_alerts')
      .upsert(
        { item_id, ...parsed.data },
        { onConflict: 'item_id' },
      )
      .select('*')
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
    const { item_id } = await context.params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('stock_alerts')
      .delete()
      .eq('item_id', item_id);

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
