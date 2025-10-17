export const timeZoneName = {
  SP: 'America/Sao_Paulo',
  UTC: 'UTC',
} as const

export type TimeZone = (typeof timeZoneName)[keyof typeof timeZoneName]
