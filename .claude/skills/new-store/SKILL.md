---
name: new-store
description: Crea un nuevo Zustand store en cozyNook siguiendo el patrón del proyecto (devtools, toasts, optimistic updates). Úsala cuando el usuario necesite gestionar estado global para un nuevo recurso.
argument-hint: <nombre-recurso>
---

Crea un nuevo Zustand store para el recurso `$ARGUMENTS` en cozyNook.

## Ubicación

`apps/web/src/store/<recurso>Store.ts`

## Patrón completo de store

```ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useUIStore } from './uiStore';

// 1. Interfaz del modelo (alineada con la DB)
export interface XxxItem {
  id: string;
  name: string;
  created_at: string;
  // ...
}

// 2. Interfaz del estado
interface XxxState {
  items: XxxItem[];
  isLoading: boolean;
  hasLoaded: boolean;
  loadItems: () => Promise<void>;
  addItem: (payload: Omit<XxxItem, 'id' | 'created_at'>) => Promise<XxxItem | null>;
  updateItem: (id: string, patch: Partial<XxxItem>) => Promise<XxxItem | null>;
  deleteItem: (id: string) => Promise<void>;
}

// 3. Helper de toasts (patrón obligatorio)
const toast = {
  success: (msg: string) => useUIStore.getState().addToast(msg, 'success'),
  error: (msg: string) => useUIStore.getState().addToast(msg, 'error'),
};

// 4. Store con devtools
export const useXxxStore = create<XxxState>()(
  devtools(
    (set, get) => ({
      items: [],
      isLoading: false,
      hasLoaded: false,

      loadItems: async () => {
        if (get().isLoading) return;
        set({ isLoading: true }, false, 'loadItems:start');
        try {
          const res = await fetch('/api/xxx', { cache: 'no-store' });
          if (!res.ok) throw new Error('No se pudieron cargar los datos');
          const items = (await res.json()) as XxxItem[];
          set({ items, hasLoaded: true }, false, 'loadItems:success');
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Error cargando datos',
          );
        } finally {
          set({ isLoading: false }, false, 'loadItems:end');
        }
      },

      addItem: async (payload) => {
        try {
          const res = await fetch('/api/xxx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const { error } = await res.json();
            throw new Error(error ?? 'No se pudo crear');
          }
          const item = (await res.json()) as XxxItem;
          set(
            (state) => ({ items: [item, ...state.items] }),
            false,
            'addItem:success',
          );
          toast.success('Creado correctamente');
          return item;
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Error creando',
          );
          return null;
        }
      },

      updateItem: async (id, patch) => {
        // Optimistic update
        set(
          (state) => ({
            items: state.items.map((i) =>
              i.id === id ? { ...i, ...patch } : i,
            ),
          }),
          false,
          'updateItem:optimistic',
        );
        try {
          const res = await fetch(`/api/xxx/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
          });
          if (!res.ok) throw new Error('No se pudo actualizar');
          const updated = (await res.json()) as XxxItem;
          set(
            (state) => ({
              items: state.items.map((i) => (i.id === id ? updated : i)),
            }),
            false,
            'updateItem:success',
          );
          return updated;
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Error actualizando',
          );
          return null;
        }
      },

      deleteItem: async (id) => {
        try {
          const res = await fetch(`/api/xxx/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('No se pudo eliminar');
          set(
            (state) => ({ items: state.items.filter((i) => i.id !== id) }),
            false,
            'deleteItem:success',
          );
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Error eliminando',
          );
        }
      },
    }),
    { name: 'nook/<recurso>' },
  ),
);
```

## Reglas obligatorias

- **Siempre** usar `devtools` middleware con `name: 'nook/<recurso>'`
- **Nunca** llamar a `useUIStore` como hook — siempre `useUIStore.getState()`
- Seguir el patrón `action:start / action:success / action:end` en los labels de devtools
- Usar `hasLoaded` para evitar fetches duplicados en `loadItems`
- Guardar `isLoading` para mostrar skeletons en la UI
- Para optimistic updates: actualizar el estado **antes** del fetch, revertir en el catch si es necesario
- Los métodos de load no devuelven datos — los guardan en el store
- Los métodos de mutación devuelven el item creado/actualizado o `null` en error
