'use client'

import { LocationBreadcrumb } from '../LocationBreadcrumb'
import { TagBadge } from '../TagBadge'
import { Card, Name, Description, Tags } from './ItemCard.styles'
import type { ItemCardProps } from './ItemCard.types'

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Card href={`/items/${item.id}`}>
      <Name>{item.name}</Name>
      {item.description && <Description>{item.description}</Description>}
      <LocationBreadcrumb room={item.location.room} spot={item.location.spot} />
      {item.tags.length > 0 && (
        <Tags>
          {item.tags.slice(0, 4).map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
        </Tags>
      )}
    </Card>
  )
}
