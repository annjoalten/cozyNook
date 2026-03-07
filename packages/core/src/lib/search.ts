import Fuse, { type IFuseOptions } from 'fuse.js'
import type { Item } from './types'

const FUSE_OPTIONS: IFuseOptions<Item> = {
  threshold: 0.4,
  includeScore: true,
  ignoreLocation: true,
  keys: [
    { name: 'name', weight: 2 },
    { name: 'tags', weight: 1.5 },
    { name: 'description', weight: 1 },
    { name: 'location.room', weight: 1 },
    { name: 'location.spot', weight: 0.8 },
    { name: 'category', weight: 0.8 },
  ],
}

/**
 * Full fuzzy search — returns matching items sorted by relevance.
 */
export function searchItems(query: string, items: Item[]): Item[] {
  if (!query.trim()) return items
  const fuse = new Fuse(items, FUSE_OPTIONS)
  return fuse.search(query).map((result) => result.item)
}

/**
 * Returns suggestion strings for a "¿Quisiste decir...?" banner
 * when the main search returns 0 results.
 *
 * Uses a looser threshold so it casts a wider net.
 */
export function getSuggestions(query: string, items: Item[]): string[] {
  if (!query.trim()) return []

  const fuse = new Fuse(items, { ...FUSE_OPTIONS, threshold: 0.6 })
  const results = fuse.search(query, { limit: 3 })

  // Collect unique candidate terms from the matched items
  const candidates = new Set<string>()
  for (const { item } of results) {
    candidates.add(item.name)
    item.tags.forEach((tag) => candidates.add(tag))
  }

  return Array.from(candidates).slice(0, 3)
}
