import type { Item } from '@nook/core';

export interface DbItemRow {
  id: string;
  name: string;
  description: string | null;
  room: string;
  spot: string;
  tags: string[] | null;
  category: string | null;
  image_url: string | null;
  created_at: string;
}

export function dbItemToItem(row: DbItemRow): Item {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    location: {
      room: row.room,
      spot: row.spot,
    },
    tags: row.tags ?? [],
    category: row.category ?? undefined,
    imageUrl: row.image_url ?? undefined,
    createdAt: row.created_at,
  };
}

export function itemToDbInsert(item: Omit<Item, 'id' | 'createdAt'>) {
  return {
    name: item.name,
    description: item.description ?? null,
    room: item.location.room,
    spot: item.location.spot,
    tags: item.tags,
    category: item.category ?? null,
    image_url: item.imageUrl ?? null,
  };
}

export function itemPatchToDbUpdate(
  patch: Partial<Omit<Item, 'id' | 'createdAt'>>,
) {
  const payload: Record<string, unknown> = {};

  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.description !== undefined)
    payload.description = patch.description ?? null;
  if (patch.location?.room !== undefined) payload.room = patch.location.room;
  if (patch.location?.spot !== undefined) payload.spot = patch.location.spot;
  if (patch.tags !== undefined) payload.tags = patch.tags;
  if (patch.category !== undefined) payload.category = patch.category ?? null;
  if (patch.imageUrl !== undefined) payload.image_url = patch.imageUrl ?? null;

  return payload;
}
