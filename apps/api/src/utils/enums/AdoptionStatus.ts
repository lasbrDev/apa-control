export const AdoptionStatus = {
  PROCESSING: 'processando',
  COMPLETED: 'concluida',
  CANCELLED: 'cancelada',
} as const

export type AdoptionStatusValue = (typeof AdoptionStatus)[keyof typeof AdoptionStatus]

export const AdoptionStatusValues = Object.values(AdoptionStatus) as [string, ...string[]]
