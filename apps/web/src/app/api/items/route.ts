import type { Item } from '@nook/core';
import { NextRequest, NextResponse } from 'next/server';
import {
  dbItemToItem,
  itemToDbInsert,
  type DbItemRow,
} from '../../../lib/items/mappers';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []) as DbItemRow[];
    return NextResponse.json(rows.map(dbItemToItem));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Omit<Item, 'id' | 'createdAt'>;

    if (
      !body?.name?.trim() ||
      !body?.location?.room?.trim() ||
      !body?.location?.spot?.trim()
    ) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('items')
      .insert(itemToDbInsert(body))
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(dbItemToItem(data as DbItemRow), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}
