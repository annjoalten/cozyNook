'use client'

import type { StockInfo } from '@nook/core'
import { LocationBreadcrumb } from '../LocationBreadcrumb'
import { TagBadge } from '../TagBadge'
import { Card, Description, MoreTag, Name, StockBadge, Tags } from './ItemCard.styles'
import type { ItemCardProps } from './ItemCard.types'

const MAX_TAGS = 3

function stockLabel(stock: StockInfo): string {
  if (stock.type === 'units') return `${stock.quantity} ud.`
  if (stock.unitsRemaining !== undefined && stock.unitsPerPackage !== undefined) {
    return `${stock.quantity} pkg · ${stock.unitsRemaining}/${stock.unitsPerPackage} ud.`
  }
  if (stock.unitsPerPackage !== undefined) {
    return `${stock.quantity} pkg × ${stock.unitsPerPackage} ud.`
  }
  return `${stock.quantity} pkg`
}

export function ItemCard({ item }: ItemCardProps) {
  const visibleTags = item.tags.slice(0, MAX_TAGS)
  const extraCount = item.tags.length - MAX_TAGS
  const isLowStock = item.stock && item.stock.quantity <= 1

  return (
    <Card href={`/items/${item.id}`}>
      <Name>{item.name}</Name>
      {item.description && <Description>{item.description}</Description>}
      <LocationBreadcrumb room={item.location.room} spot={item.location.spot} />
      {item.stock && (
        <StockBadge $low={isLowStock}>
          {isLowStock ? '⚠ ' : ''}Stock: {stockLabel(item.stock)}
        </StockBadge>
      )}
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
