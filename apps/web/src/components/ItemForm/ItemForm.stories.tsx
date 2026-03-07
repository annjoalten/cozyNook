import type { Meta, StoryObj } from '@storybook/nextjs'
import { ItemForm } from './ItemForm'
import type { Item } from '@nook/core'

const meta: Meta<typeof ItemForm> = {
  title: 'Components/ItemForm',
  component: ItemForm,
  tags: ['autodocs'],
  parameters: { nextjs: { appDirectory: true } },
}
export default meta
type Story = StoryObj<typeof ItemForm>

export const AddNew: Story = {
  args: {},
}

export const EditExisting: Story = {
  args: {
    initial: {
      id: '1',
      name: 'Destornillador estrella',
      description: 'Phillips mediano, mango rojo.',
      location: { room: 'Trastero', spot: 'Cajón de herramientas' },
      tags: ['phillips', 'herramienta'],
      createdAt: new Date().toISOString(),
    } satisfies Item,
  },
}
