export const UrgencyLevel = {
  ROUTINE: 'rotina',
  URGENT: 'urgente',
  EMERGENCY: 'emergencia',
} as const

export type UrgencyLevelValue = (typeof UrgencyLevel)[keyof typeof UrgencyLevel]

export const UrgencyLevelValues = Object.values(UrgencyLevel) as [string, ...string[]]
