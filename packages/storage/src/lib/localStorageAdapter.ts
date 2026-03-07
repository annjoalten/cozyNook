export class LocalStorageAdapter {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  }

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // localStorage may be full or blocked (private browsing)
    }
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(key)
  }

  list(): string[] {
    if (typeof window === 'undefined') return []
    return Object.keys(window.localStorage)
  }
}

export const storage = new LocalStorageAdapter()
