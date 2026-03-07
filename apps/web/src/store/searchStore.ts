import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Item } from '@nook/core'

interface SearchState {
  query: string
  results: Item[]
  suggestions: string[]
  isSearching: boolean
  setQuery: (query: string) => void
  setResults: (results: Item[]) => void
  setSuggestions: (suggestions: string[]) => void
  clearSearch: () => void
}

export const useSearchStore = create<SearchState>()(
  devtools(
    (set) => ({
      query: '',
      results: [],
      suggestions: [],
      isSearching: false,

      setQuery: (query) =>
        set({ query, isSearching: query.length > 0 }, false, 'setQuery'),

      setResults: (results) =>
        set({ results }, false, 'setResults'),

      setSuggestions: (suggestions) =>
        set({ suggestions }, false, 'setSuggestions'),

      clearSearch: () =>
        set(
          { query: '', results: [], suggestions: [], isSearching: false },
          false,
          'clearSearch'
        ),
    }),
    { name: 'nook/search' }
  )
)
