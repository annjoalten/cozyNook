'use client'

import { LocationBreadcrumb } from '../LocationBreadcrumb'
import { TagBadge } from '../TagBadge'
import { Card, Name, Description, Tags, MoreTag } from './ItemCard.styles'
import type { ItemCardProps } from './ItemCard.types'

const MAX_TAGS = 3

export function ItemCard({ item }: ItemCardProps) {
  const visibleTags = item.tags.slice(0, MAX_TAGS)
  const extraCount = item.tags.length - MAX_TAGS

  return (
    <Card href={`/items/${item.id}`}>
      <Name>{item.name}</Name>
      {item.description && <Description>{item.description}</Description>}
      <LocationBreadcrumb room={item.location.room} spot={item.location.spot} />
      {item.tags.length > 0 && (
        <Tags>
          {visibleTags.map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
          {extraCount > 0 && <MoreTag>+{extraCount} más</MoreTag>}
        </Tags>
      )}
    </Card>
  )
}
