import type { Meta, StoryObj } from '@storybook/nextjs'
import { SearchResults } from './SearchResults'
import type { Item } from '@nook/core'

const meta: Meta<typeof SearchResults> = {
  title: 'Components/SearchResults',
  component: SearchResults,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof SearchResults>

const items: Item[] = [
  { id: '1', name: 'Destornillador estrella', location: { room: 'Trastero', spot: 'Cajón herramientas' }, tags: ['phillips'], createdAt: new Date().toISOString() },
  { id: '2', name: 'Adaptador HDMI', description: 'Negro, 20cm', location: { room: 'Salón', spot: 'Cajón TV' }, tags: ['cable', 'pantalla'], createdAt: new Date().toISOString() },
  { id: '3', name: 'Tijeras de cocina', location: { room: 'Cocina', spot: 'Cajón izquierdo' }, tags: ['cortar'], createdAt: new Date().toISOString() },
]

export const WithResults: Story = {
  args: { items, query: 'destornillador' },
}

export const NoResults: Story = {
  args: { items: [], query: 'xylophone' },
}
