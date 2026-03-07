'use client'

import { motion } from 'framer-motion'
import { ItemCard } from '../ItemCard'
import { EmptyState } from '../EmptyState'
import { Grid, motionVariants } from './SearchResults.styles'
import type { SearchResultsProps } from './SearchResults.types'

export function SearchResults({ items, query }: SearchResultsProps) {
  if (items.length === 0) return <EmptyState query={query} />

  return (
    <Grid
      as={motion.div}
      variants={motionVariants.container}
      initial="hidden"
      animate="show"
    >
      {items.map((item) => (
        <motion.div key={item.id} variants={motionVariants.item}>
          <ItemCard item={item} />
        </motion.div>
      ))}
    </Grid>
  )
}
