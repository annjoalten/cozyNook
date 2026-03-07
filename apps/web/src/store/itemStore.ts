import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Item } from '@nook/core'

interface ItemState {
  items: Item[]
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => void
  updateItem: (id: string, patch: Partial<Omit<Item, 'id' | 'createdAt'>>) => void
  deleteItem: (id: string) => void
  getItemById: (id: string) => Item | undefined
}

export const useItemStore = create<ItemState>()(
  devtools(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set(
          (state) => ({
            items: [
              ...state.items,
              {
                ...item,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
              },
            ],
          }),
          false,
          'addItem'
        ),

      updateItem: (id, patch) =>
        set(
          (state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, ...patch } : item
            ),
          }),
          false,
          'updateItem'
        ),

      deleteItem: (id) =>
        set(
          (state) => ({ items: state.items.filter((item) => item.id !== id) }),
          false,
          'deleteItem'
        ),

      getItemById: (id) => get().items.find((item) => item.id === id),
    }),
    { name: 'nook/items' }
  )
)
