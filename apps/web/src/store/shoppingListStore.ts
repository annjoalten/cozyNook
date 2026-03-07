import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useUIStore } from './uiStore';

export interface ShoppingListItem {
  id: string;
  item_id: string;
  quantity_needed: number;
  checked: boolean;
  note: string | null;
  created_at: string;
  checked_at: string | null;
  item: {
    id: string;
    name: string;
    category: string | null;
    room: string;
    spot: string;
  };
}

interface ShoppingListState {
  entries: ShoppingListItem[];
  isLoading: boolean;
  hasLoaded: boolean;
  loadList: () => Promise<void>;
  addEntry: (payload: { item_id: string; quantity_needed?: number; note?: string }) => Promise<ShoppingListItem | null>;
  toggleChecked: (id: string, checked: boolean) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

const toast = {
  success: (msg: string) => useUIStore.getState().addToast(msg, 'success'),
  error: (msg: string) => useUIStore.getState().addToast(msg, 'error'),
};

export const useShoppingListStore = create<ShoppingListState>()(
  devtools(
    (set, get) => ({
      entries: [],
      isLoading: false,
      hasLoaded: false,

      loadList: async () => {
        if (get().isLoading) return;
        set({ isLoading: true }, false, 'loadList:start');
        try {
          const res = await fetch('/api/shopping-list', { cache: 'no-store' });
          if (!res.ok) throw new Error('No se pudo cargar la lista de la compra');
          const entries = (await res.json()) as ShoppingListItem[];
          set({ entries, hasLoaded: true }, false, 'loadList:success');
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Error cargando la lista',
          );
        } finally {
          set({ isLoading: false }, false, 'loadList:end');
        }
      },

      addEntry: async (payload) => {
        try {
          const res = await fetch('/api/shopping-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const { error } = await res.json();
            throw new Error(error ?? 'No se pudo añadir a la lista');
          }

          const entry = (await res.json()) as ShoppingListItem;
          set(
            (state) => ({ entries: [entry, ...state.entries] }),
            false,
            'addEntry:success',
          );
          toast.success('Añadido a la lista de la compra');
          return entry;
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Error añadiendo a la lista',
          );
          return null;
        }
      },

      toggleChecked: async (id, checked) => {
        // Optimistic update
        set(
          (state) => ({
            entries: state.entries.map((e) =>
              e.id === id ? { ...e, checked } : e,
            ),
          }),
          false,
          'toggleChecked:optimistic',
        );
        try {
          const res = await fetch(`/api/shopping-list/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checked }),
          });

          if (!res.ok) throw new Error('No se pudo actualizar');

          const updated = (await res.json()) as ShoppingListItem;
          set(
            (state) => ({
              entries: state.entries.map((e) => (e.id === id ? updated : e)),
            }),
            false,
            'toggleChecked:success',
          );
        } catch (error) {
          // Revert optimistic update
          set(
            (state) => ({
              entries: state.entries.map((e) =>
                e.id === id ? { ...e, checked: !checked } : e,
              ),
            }),
            false,
            'toggleChecked:revert',
          );
          toast.error(
            error instanceof Error ? error.message : 'Error actualizando',
          );
        }
      },

      deleteEntry: async (id) => {
        set(
          (state) => ({ entries: state.entries.filter((e) => e.id !== id) }),
          false,
          'deleteEntry:optimistic',
        );
        try {
          const res = await fetch(`/api/shopping-list/${id}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error('No se pudo eliminar');
        } catch (error) {
          // Reload to restore state
          await get().loadList();
          toast.error(
            error instanceof Error ? error.message : 'Error eliminando',
          );
        }
      },
    }),
    { name: 'nook/shopping-list' },
  ),
);
