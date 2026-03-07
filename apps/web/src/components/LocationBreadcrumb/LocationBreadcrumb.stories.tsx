import type { Meta, StoryObj } from '@storybook/nextjs'
import { LocationBreadcrumb } from './LocationBreadcrumb'

const meta: Meta<typeof LocationBreadcrumb> = {
  title: 'Components/LocationBreadcrumb',
  component: LocationBreadcrumb,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof LocationBreadcrumb>

export const Default: Story = {
  args: { room: 'Cocina', spot: 'Cajón izquierdo' },
}

export const LongSpot: Story = {
  args: { room: 'Trastero', spot: 'Estante de arriba, caja marrón' },
}

export const AllRooms: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {['Cocina', 'Salón', 'Dormitorio principal', 'Trastero', 'Garaje'].map((room) => (
        <LocationBreadcrumb key={room} room={room} spot="Cajón central" />
      ))}
    </div>
  ),
}
