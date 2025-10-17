export const Sex = {
  MALE: 'macho',
  FEMALE: 'femea',
} as const

export type SexValue = (typeof Sex)[keyof typeof Sex]

export const SexValues = Object.values(Sex) as [string, ...string[]]
