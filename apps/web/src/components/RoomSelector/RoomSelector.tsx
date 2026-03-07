'use client'

import { ROOMS } from '@nook/core'
import { Wrapper, Chip } from './RoomSelector.styles'
import type { RoomSelectorProps } from './RoomSelector.types'

export function RoomSelector({ value, onChange }: RoomSelectorProps) {
  return (
    <Wrapper>
      <Chip $active={value === null} onClick={() => onChange(null)}>
        Todas
      </Chip>
      {ROOMS.map((room) => (
        <Chip
          key={room}
          $active={value === room}
          onClick={() => onChange(value === room ? null : room)}
        >
          {room}
        </Chip>
      ))}
    </Wrapper>
  )
}
