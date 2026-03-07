'use client'

import { useEffect, useRef, useState } from 'react'
import { CaretDown, Plus } from '@phosphor-icons/react'
import { ROOMS } from '@nook/core'
import { useUIStore } from '../../store/uiStore'
import {
  AddRoomInput,
  AddRoomRow,
  Option,
  Panel,
  Trigger,
  Wrapper,
} from './RoomDropdown.styles'
import type { RoomDropdownProps } from './RoomDropdown.types'

export function RoomDropdown({
  value,
  onChange,
  placeholder = 'Elige una habitación…',
}: RoomDropdownProps) {
  const { customRooms, addCustomRoom } = useUIStore()
  const [open, setOpen] = useState(false)
  const [newRoom, setNewRoom] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const allRooms = [...ROOMS, ...customRooms]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(room: string) {
    onChange(room)
    setOpen(false)
  }

  function handleAddRoom(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && newRoom.trim()) {
      e.preventDefault()
      const name = newRoom.trim()
      addCustomRoom(name)
      onChange(name)
      setNewRoom('')
      setOpen(false)
    }
  }

  return (
    <Wrapper ref={wrapperRef}>
      <Trigger
        type="button"
        $hasValue={!!value}
        onClick={() => {
          setOpen((o) => !o)
          if (!open) setTimeout(() => inputRef.current?.focus(), 50)
        }}
      >
        <span>{value || placeholder}</span>
        <CaretDown size={14} weight="bold" />
      </Trigger>

      {open && (
        <Panel>
          {allRooms.map((room) => (
            <Option
              key={room}
              type="button"
              $selected={room === value}
              onClick={() => handleSelect(room)}
            >
              {room}
            </Option>
          ))}
          <AddRoomRow>
            <Plus size={12} weight="bold" />
            <AddRoomInput
              ref={inputRef}
              placeholder="Nueva habitación…"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              onKeyDown={handleAddRoom}
            />
          </AddRoomRow>
        </Panel>
      )}
    </Wrapper>
  )
}
