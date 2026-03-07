import type { Meta, StoryObj } from '@storybook/nextjs'
import { TagBadge } from './TagBadge'

const meta: Meta<typeof TagBadge> = {
  title: 'Components/TagBadge',
  component: TagBadge,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof TagBadge>

export const Default: Story = {
  args: { label: 'herramienta' },
}

export const Clickable: Story = {
  args: { label: 'cocina', onClick: () => alert('clicked') },
}

export const AllTags: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {['destornillador', 'phillips', 'herramienta', 'tornillo', 'bricolaje'].map((t) => (
        <TagBadge key={t} label={t} />
      ))}
    </div>
  ),
}
