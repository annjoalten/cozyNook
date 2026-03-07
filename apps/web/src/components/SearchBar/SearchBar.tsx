'use client'

import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { Wrapper, Input, IconLeft, ClearButton } from './SearchBar.styles'
import type { SearchBarProps } from './SearchBar.types'

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Busca cualquier cosa… destornillador, HDMI, tijeras…',
}: SearchBarProps) {
  return (
    <Wrapper>
      <IconLeft><MagnifyingGlass size={20} weight="light" /></IconLeft>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <ClearButton onClick={onClear} aria-label="Borrar búsqueda">
          <X size={18} />
        </ClearButton>
      )}
    </Wrapper>
  )
}
