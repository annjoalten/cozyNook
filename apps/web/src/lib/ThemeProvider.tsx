'use client'

import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { theme } from '@nook/ui-tokens'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
}
