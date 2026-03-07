'use client'

import { Wrapper, Crumb, Sep } from './LocationBreadcrumb.styles'
import type { LocationBreadcrumbProps } from './LocationBreadcrumb.types'

export function LocationBreadcrumb({ room, spot }: LocationBreadcrumbProps) {
  return (
    <Wrapper>
      <Crumb>{room}</Crumb>
      <Sep>›</Sep>
      <Crumb>{spot}</Crumb>
    </Wrapper>
  )
}
