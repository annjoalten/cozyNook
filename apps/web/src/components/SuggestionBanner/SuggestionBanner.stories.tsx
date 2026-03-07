import type { Meta, StoryObj } from '@storybook/nextjs'
import { SuggestionBanner } from './SuggestionBanner'

const meta: Meta<typeof SuggestionBanner> = {
  title: 'Components/SuggestionBanner',
  component: SuggestionBanner,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof SuggestionBanner>

export const WithSuggestions: Story = {
  args: {
    suggestions: ['destornillador', 'tornillo', 'herramienta'],
    onSelect: (s: string) => alert(`Seleccionado: ${s}`),
  },
}

export const SingleSuggestion: Story = {
  args: {
    suggestions: ['destornillador'],
    onSelect: () => {},
  },
}

export const Empty: Story = {
  args: { suggestions: [], onSelect: () => {} },
}
