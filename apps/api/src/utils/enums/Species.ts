export const Species = {
  CANINE: 'canina',
  FELINE: 'felina',
  OTHER: 'outros',
} as const

export type SpeciesValue = (typeof Species)[keyof typeof Species]

export const SpeciesValues = Object.values(Species) as [string, ...string[]]
