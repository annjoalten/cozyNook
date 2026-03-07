'use client'

import { AnimatePresence } from 'framer-motion'
import { Banner, Pill } from './SuggestionBanner.styles'
import type { SuggestionBannerProps } from './SuggestionBanner.types'

export function SuggestionBanner({ suggestions, onSelect }: SuggestionBannerProps) {
  if (suggestions.length === 0) return null

  return (
    <AnimatePresence>
      <Banner
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
      >
        <span>¿Quisiste decir…?</span>
        {suggestions.map((s) => (
          <Pill key={s} onClick={() => onSelect(s)}>{s}</Pill>
        ))}
      </Banner>
    </AnimatePresence>
  )
}
