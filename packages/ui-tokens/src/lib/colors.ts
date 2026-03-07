export const colors = {
  parchment: '#F5F0E8',
  cream: '#D9CDBF',
  taupe: '#A6998A',
  olive: '#4C591B',
  bark: '#59422E',
  clay: '#734432',
  terracotta: '#D95043',
  salmon: '#D96B62',
  sand: '#BF926B',
  mauve: '#8C6865',
} as const

export type ColorToken = keyof typeof colors
export type ColorValue = (typeof colors)[ColorToken]
