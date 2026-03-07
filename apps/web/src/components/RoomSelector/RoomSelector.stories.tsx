import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { RoomSelector } from './RoomSelector'

const meta: Meta<typeof RoomSelector> = {
  title: 'Components/RoomSelector',
  component: RoomSelector,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof RoomSelector>

export const NoneSelected: Story = {
  args: { value: null, onChange: () => {} },
}

export const RoomSelected: Story = {
  args: { value: 'Cocina', onChange: () => {} },
}

export const Interactive: Story = {
  render: () => {
    const [room, setRoom] = useState<string | null>(null)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <RoomSelector value={room} onChange={setRoom} />
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: '#A6998A' }}>
          Seleccionado: {room ?? 'Todas'}
        </p>
      </div>
    )
  },
}
