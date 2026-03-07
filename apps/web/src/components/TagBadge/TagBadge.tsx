'use client'

import { Badge } from './TagBadge.styles'
import type { TagBadgeProps } from './TagBadge.types'

export function TagBadge({ label, onClick }: TagBadgeProps) {
  return (
    <Badge $clickable={!!onClick} onClick={onClick}>
      {label}
    </Badge>
  )
}
