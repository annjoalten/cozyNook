import type { PersistStorage, StorageValue } from 'zustand/middleware'
import { storage } from './localStorageAdapter'

/**
 * Zustand-compatible storage adapter backed by LocalStorageAdapter.
 * Use this with Zustand's built-in `persist` middleware:
 *
 * ```ts
 * import { persist } from 'zustand/middleware'
 * import { nookStorage } from '@nook/storage'
 *
 * const useItemStore = create(persist(storeCreator, { name: 'nook/items', storage: nookStorage }))
 * ```
 */
export function createNookStorage<T>(): PersistStorage<T> {
  return {
    getItem(key): StorageValue<T> | null {
      return storage.get<StorageValue<T>>(key)
    },
    setItem(key, value): void {
      storage.set(key, value)
    },
    removeItem(key): void {
      storage.delete(key)
    },
  }
}
