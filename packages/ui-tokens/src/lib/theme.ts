import { colors } from './colors'
import { fontFamily, fontSize, fontWeight, lineHeight, radii, shadow } from './typography'

export const theme = {
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  radii,
  shadow,
} as const

export type NookTheme = typeof theme
