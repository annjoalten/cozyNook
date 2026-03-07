'use client'

import { useRef, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { ROOMS } from '@nook/core'
import { useUIStore } from '../../store/uiStore'
import { Wrapper, Chip, AddChip, AddInput } from './RoomSelector.styles'
import type { RoomSelectorProps } from './RoomSelector.types'

export function RoomSelector({ value, onChange }: RoomSelectorProps) {
  const { customRooms, addCustomRoom } = useUIStore()
  const [adding, setAdding] = useState(false)
  const [newRoom, setNewRoom] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const allRooms = [...ROOMS, ...customRooms]

  function handleAddClick() {
    setAdding(true)
    setTimeout(() => inputRef.current?.focus(), 30)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && newRoom.trim()) {
      const name = newRoom.trim()
      addCustomRoom(name)
      onChange(name)
      setNewRoom('')
      setAdding(false)
    }
    if (e.key === 'Escape') {
      setNewRoom('')
      setAdding(false)
    }
  }

  return (
    <Wrapper>
      <Chip $active={value === null} onClick={() => onChange(null)}>
        Todas
      </Chip>
      {allRooms.map((room) => (
        <Chip
          key={room}
          $active={value === room}
          onClick={() => onChange(value === room ? null : room)}
        >
          {room}
        </Chip>
      ))}
      {adding ? (
        <AddInput
          ref={inputRef}
          placeholder="Nueva habitación…"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setNewRoom('')
            setAdding(false)
          }}
        />
      ) : (
        <AddChip type="button" onClick={handleAddClick} title="Añadir habitación">
          <Plus size={12} weight="bold" />
        </AddChip>
      )}
    </Wrapper>
  )
}
