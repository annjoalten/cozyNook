import { useEffect } from 'react'
import { searchItems, getSuggestions } from '@nook/core'
import { useItemStore } from '../store/itemStore'
import { useSearchStore } from '../store/searchStore'
import { useDebounce } from './useDebounce'

export function useSearch() {
  const items = useItemStore((s) => s.items)
  const { query, results, suggestions, isSearching, setQuery, setResults, setSuggestions, clearSearch } =
    useSearchStore()

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setSuggestions([])
      return
    }

    const found = searchItems(debouncedQuery, items)
    setResults(found)

    if (found.length === 0) {
      setSuggestions(getSuggestions(debouncedQuery, items))
    } else {
      setSuggestions([])
    }
  }, [debouncedQuery, items, setResults, setSuggestions])

  return { query, results, suggestions, isSearching, setQuery, clearSearch }
}
