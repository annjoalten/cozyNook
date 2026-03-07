import type { Meta, StoryObj } from '@storybook/nextjs'
import { EmptyState } from './EmptyState'

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof EmptyState>

export const NoItems: Story = {
  args: {},
}

export const NoResults: Story = {
  args: { query: 'destornilador' },
}
