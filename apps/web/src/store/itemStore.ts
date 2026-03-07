import type { Item } from '@nook/core';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ItemState {
  items: Item[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  loadItems: () => Promise<void>;
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => Promise<Item | null>;
  updateItem: (
    id: string,
    patch: Partial<Omit<Item, 'id' | 'createdAt'>>,
  ) => Promise<Item | null>;
  deleteItem: (id: string) => Promise<boolean>;
  getItemById: (id: string) => Item | undefined;
  clearError: () => void;
}

export const useItemStore = create<ItemState>()(
  devtools(
    (set, get) => ({
      items: [],
      isLoading: false,
      hasLoaded: false,
      error: null,

      loadItems: async () => {
        if (get().isLoading) return;
        set({ isLoading: true, error: null }, false, 'loadItems:start');
        try {
          const res = await fetch('/api/items', { cache: 'no-store' });
          if (!res.ok) {
            throw new Error('No se pudo cargar el inventario');
          }
          const items = (await res.json()) as Item[];
          set({ items, hasLoaded: true }, false, 'loadItems:success');
        } catch (error) {
          set(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Error cargando inventario',
            },
            false,
            'loadItems:error',
          );
        } finally {
          set({ isLoading: false }, false, 'loadItems:end');
        }
      },

      addItem: async (item) => {
        set({ error: null }, false, 'addItem:start');
        try {
          const res = await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          });

          if (!res.ok) {
            throw new Error('No se pudo crear el objeto');
          }

          const created = (await res.json()) as Item;
          set(
            (state) => ({ items: [created, ...state.items] }),
            false,
            'addItem:success',
          );
          return created;
        } catch (error) {
          set(
            {
              error:
                error instanceof Error ? error.message : 'Error creando objeto',
            },
            false,
            'addItem:error',
          );
          return null;
        }
      },

      updateItem: async (id, patch) => {
        set({ error: null }, false, 'updateItem:start');
        try {
          const res = await fetch(`/api/items/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
          });

          if (!res.ok) {
            throw new Error('No se pudo actualizar el objeto');
          }

          const updated = (await res.json()) as Item;
          set(
            (state) => ({
              items: state.items.map((item) =>
                item.id === id ? updated : item,
              ),
            }),
            false,
            'updateItem:success',
          );
          return updated;
        } catch (error) {
          set(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Error actualizando objeto',
            },
            false,
            'updateItem:error',
          );
          return null;
        }
      },

      deleteItem: async (id) => {
        set({ error: null }, false, 'deleteItem:start');
        try {
          const res = await fetch(`/api/items/${id}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            throw new Error('No se pudo eliminar el objeto');
          }

          set(
            (state) => ({
              items: state.items.filter((item) => item.id !== id),
            }),
            false,
            'deleteItem:success',
          );
          return true;
        } catch (error) {
          set(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Error eliminando objeto',
            },
            false,
            'deleteItem:error',
          );
          return false;
        }
      },

      getItemById: (id) => get().items.find((item) => item.id === id),

      clearError: () => set({ error: null }, false, 'clearError'),
    }),
    { name: 'nook/items' },
  ),
);
