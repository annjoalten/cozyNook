import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { SearchBar } from './SearchBar'

const meta: Meta<typeof SearchBar> = {
  title: 'Components/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof SearchBar>

export const Empty: Story = {
  args: { value: '', onChange: () => {}, onClear: () => {} },
}

export const WithQuery: Story = {
  args: { value: 'destornillador', onChange: () => {}, onClear: () => {} },
}

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <SearchBar
        value={value}
        onChange={setValue}
        onClear={() => setValue('')}
      />
    )
  },
}
