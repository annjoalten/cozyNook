import type { Meta, StoryObj } from '@storybook/nextjs'
import { ItemCard } from './ItemCard'

const meta: Meta<typeof ItemCard> = {
  title: 'Components/ItemCard',
  component: ItemCard,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof ItemCard>

const base = {
  id: '1',
  name: 'Destornillador estrella',
  description: 'Phillips mediano, mango rojo. Sirve para el mueble del salón.',
  location: { room: 'Trastero', spot: 'Cajón de herramientas' },
  tags: ['phillips', 'herramienta', 'tornillo'],
  createdAt: new Date().toISOString(),
}

export const Full: Story = {
  args: { item: base },
}

export const NoDescription: Story = {
  args: { item: { ...base, id: '2', description: undefined } },
}

export const NoTags: Story = {
  args: { item: { ...base, id: '3', tags: [] } },
}

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      <ItemCard item={{ ...base, id: '4' }} />
      <ItemCard item={{ ...base, id: '5', name: 'Adaptador HDMI', location: { room: 'Salón', spot: 'Cajón TV' }, tags: ['cable', 'pantalla'] }} />
      <ItemCard item={{ ...base, id: '6', name: 'Tijeras de cocina', description: undefined, location: { room: 'Cocina', spot: 'Cajón izquierdo' }, tags: [] }} />
    </div>
  ),
}
