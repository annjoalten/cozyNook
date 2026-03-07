import type { Item } from '@nook/core';
import { NextRequest, NextResponse } from 'next/server';
import {
  dbItemToItem,
  itemPatchToDbUpdate,
  type DbItemRow,
} from '../../../../lib/items/mappers';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const patch = (await request.json()) as Partial<
      Omit<Item, 'id' | 'createdAt'>
    >;
    const payload = itemPatchToDbUpdate(patch);

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'Empty patch' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('items')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(dbItemToItem(data as DbItemRow));
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
    const { error } = await supabase.from('items').delete().eq('id', id);

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
