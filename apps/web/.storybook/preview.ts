import type { Preview } from '@storybook/nextjs'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../../../packages/ui-tokens/src'

const preview: Preview = {
  decorators: [
    (Story) => {
      return React.createElement(
        ThemeProvider,
        { theme },
        React.createElement(Story)
      )
    },
  ],
  parameters: {
    backgrounds: {
      default: 'parchment',
      values: [
        { name: 'parchment', value: '#F5F0E8' },
        { name: 'white', value: '#ffffff' },
        { name: 'bark', value: '#59422E' },
      ],
    },
    layout: 'padded',
  },
}

export default preview
