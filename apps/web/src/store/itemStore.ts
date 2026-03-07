import type { Item } from '@nook/core';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useUIStore } from './uiStore';

const toast = {
  success: (msg: string) => useUIStore.getState().addToast(msg, 'success'),
  error: (msg: string) => useUIStore.getState().addToast(msg, 'error'),
};

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
          toast.success('Objeto añadido correctamente');
          return created;
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : 'Error creando objeto';
          set({ error: msg }, false, 'addItem:error');
          toast.error(msg);
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
          toast.success('Cambios guardados');
          return updated;
        } catch (error) {
          const msg =
            error instanceof Error
              ? error.message
              : 'Error actualizando objeto';
          set({ error: msg }, false, 'updateItem:error');
          toast.error(msg);
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
          toast.success('Objeto eliminado');
          return true;
        } catch (error) {
          const msg =
            error instanceof Error
              ? error.message
              : 'Error eliminando objeto';
          set({ error: msg }, false, 'deleteItem:error');
          toast.error(msg);
          return false;
        }
      },

      getItemById: (id) => get().items.find((item) => item.id === id),

      clearError: () => set({ error: null }, false, 'clearError'),
    }),
    { name: 'nook/items' },
  ),
);
