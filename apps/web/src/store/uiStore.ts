import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UIState {
  activeRoom: string | null
  isAddModalOpen: boolean
  editingItemId: string | null
  toasts: Toast[]
  customRooms: string[]
  setActiveRoom: (room: string | null) => void
  openAddModal: () => void
  closeAddModal: () => void
  openEditModal: (itemId: string) => void
  closeEditModal: () => void
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
  addCustomRoom: (room: string) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      activeRoom: null,
      isAddModalOpen: false,
      editingItemId: null,
      toasts: [],
      customRooms: [],

      setActiveRoom: (room) =>
        set({ activeRoom: room }, false, 'setActiveRoom'),

      openAddModal: () =>
        set({ isAddModalOpen: true }, false, 'openAddModal'),

      closeAddModal: () =>
        set({ isAddModalOpen: false }, false, 'closeAddModal'),

      openEditModal: (itemId) =>
        set({ editingItemId: itemId }, false, 'openEditModal'),

      closeEditModal: () =>
        set({ editingItemId: null }, false, 'closeEditModal'),

      addToast: (message, type = 'info') =>
        set(
          (state) => ({
            toasts: [
              ...state.toasts,
              { id: crypto.randomUUID(), message, type },
            ],
          }),
          false,
          'addToast'
        ),

      removeToast: (id) =>
        set(
          (state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }),
          false,
          'removeToast'
        ),

      addCustomRoom: (room) =>
        set(
          (state) => ({
            customRooms: state.customRooms.includes(room)
              ? state.customRooms
              : [...state.customRooms, room],
          }),
          false,
          'addCustomRoom'
        ),
    }),
    { name: 'nook/ui' }
  )
)
