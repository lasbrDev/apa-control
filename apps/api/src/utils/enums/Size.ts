export const Size = {
  SMALL: 'pequeno',
  MEDIUM: 'medio',
  LARGE: 'grande',
} as const

export type SizeValue = (typeof Size)[keyof typeof Size]

export const SizeValues = Object.values(Size) as [string, ...string[]]
