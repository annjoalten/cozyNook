import { z } from 'zod';

const locationSchema = z.object({
  room: z.string().min(1, 'La habitación es obligatoria'),
  spot: z.string().min(1, 'El lugar exacto es obligatorio'),
});

export const itemCreateSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(200),
  description: z.string().max(1000).optional(),
  location: locationSchema,
  tags: z.array(z.string().max(50)).max(20).default([]),
  category: z.string().max(100).optional(),
  imageUrl: z.string().url().optional(),
});

export const itemPatchSchema = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).nullable(),
    location: locationSchema,
    tags: z.array(z.string().max(50)).max(20),
    category: z.string().max(100).nullable(),
    imageUrl: z.string().url().nullable(),
  })
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'El patch no puede estar vacío',
  });

export type ItemCreateInput = z.infer<typeof itemCreateSchema>;
export type ItemPatchInput = z.infer<typeof itemPatchSchema>;
