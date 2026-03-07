import type { Item } from '@nook/core'
import { z } from 'zod'

export const itemSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  location: z.object({
    room: z.string().min(1, 'La habitación es obligatoria'),
    spot: z.string().min(1, 'El lugar exacto es obligatorio'),
  }),
  tags: z.string(),
  category: z.string().optional(),
})

export type FormValues = z.infer<typeof itemSchema>
export type FormErrors = Partial<Record<keyof FormValues | 'location.room' | 'location.spot', string>>

export type StockType = 'units' | 'packages'

export interface StockFormState {
  enabled: boolean;
  type: StockType;
  quantity: string;
  unitsPerPackage: string;
  unitsRemaining: string;
}

export interface ItemFormProps {
  initial?: Item
}
