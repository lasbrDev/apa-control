export const ProcedureStatus = {
  SCHEDULED: 'agendado',
  COMPLETED: 'realizado',
  CANCELLED: 'cancelado',
} as const

export type ProcedureStatusValue = (typeof ProcedureStatus)[keyof typeof ProcedureStatus]

export const ProcedureStatusValues = Object.values(ProcedureStatus) as [string, ...string[]]
