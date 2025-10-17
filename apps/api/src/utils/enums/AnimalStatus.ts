export const AnimalStatus = {
  AVAILABLE: 'disponivel',
  IN_TREATMENT: 'em_tratamento',
  ADOPTED: 'adotado',
} as const

export type AnimalStatusValue = (typeof AnimalStatus)[keyof typeof AnimalStatus]

export const AnimalStatusValues = Object.values(AnimalStatus) as [string, ...string[]]
