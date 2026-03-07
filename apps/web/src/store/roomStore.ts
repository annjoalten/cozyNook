import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useUIStore } from './uiStore';

export interface Room {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface RoomInput {
  name: string;
  description?: string;
  imageUrl?: string;
}

interface RoomState {
  rooms: Room[];
  isLoading: boolean;
  hasLoaded: boolean;
  loadRooms: () => Promise<void>;
  addRoom: (payload: RoomInput) => Promise<Room | null>;
  updateRoom: (id: string, payload: RoomInput) => Promise<Room | null>;
  deleteRoom: (id: string) => Promise<boolean>;
}

const toast = {
  success: (msg: string) => useUIStore.getState().addToast(msg, 'success'),
  error: (msg: string) => useUIStore.getState().addToast(msg, 'error'),
};

export const useRoomStore = create<RoomState>()(
  devtools(
    (set, get) => ({
      rooms: [],
      isLoading: false,
      hasLoaded: false,

      loadRooms: async () => {
        if (get().isLoading) return;
        set({ isLoading: true }, false, 'loadRooms:start');
        try {
          const res = await fetch('/api/rooms', { cache: 'no-store' });
          if (!res.ok)
            throw new Error('No se pudieron cargar las habitaciones');
          const rooms = (await res.json()) as Room[];
          set({ rooms, hasLoaded: true }, false, 'loadRooms:success');
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Error cargando habitaciones',
          );
        } finally {
          set({ isLoading: false }, false, 'loadRooms:end');
        }
      },

      addRoom: async (payload) => {
        try {
          const res = await fetch('/api/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const { error } = await res.json();
            throw new Error(error ?? 'No se pudo crear la habitación');
          }

          const room = (await res.json()) as Room;
          set(
            (state) => ({
              rooms: [...state.rooms, room].sort((a, b) =>
                a.name.localeCompare(b.name),
              ),
            }),
            false,
            'addRoom:success',
          );
          toast.success(`Habitación "${room.name}" añadida`);
          return room;
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Error creando habitación',
          );
          return null;
        }
      },

      updateRoom: async (id, payload) => {
        try {
          const res = await fetch(`/api/rooms/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const { error } = await res.json();
            throw new Error(error ?? 'No se pudo actualizar la habitación');
          }

          const room = (await res.json()) as Room;
          set(
            (state) => ({
              rooms: state.rooms
                .map((r) => (r.id === id ? room : r))
                .sort((a, b) => a.name.localeCompare(b.name)),
            }),
            false,
            'updateRoom:success',
          );
          toast.success('Habitación actualizada');
          return room;
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Error actualizando habitación',
          );
          return null;
        }
      },

      deleteRoom: async (id) => {
        try {
          const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });

          if (!res.ok) {
            const { error } = await res.json();
            throw new Error(error ?? 'No se pudo eliminar la habitación');
          }

          set(
            (state) => ({ rooms: state.rooms.filter((r) => r.id !== id) }),
            false,
            'deleteRoom:success',
          );
          toast.success('Habitación eliminada');
          return true;
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Error eliminando habitación',
          );
          return false;
        }
      },
    }),
    { name: 'nook/rooms' },
  ),
);
