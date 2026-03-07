import type { NookTheme } from '@nook/ui-tokens'

declare module 'styled-components' {
  export interface DefaultTheme extends NookTheme {}
}
