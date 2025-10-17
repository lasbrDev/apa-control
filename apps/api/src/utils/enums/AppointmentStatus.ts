export const AppointmentStatus = {
  SCHEDULED: 'agendado',
  COMPLETED: 'realizado',
  CANCELLED: 'cancelado',
} as const

export type AppointmentStatusValue = (typeof AppointmentStatus)[keyof typeof AppointmentStatus]

export const AppointmentStatusValues = Object.values(AppointmentStatus) as [string, ...string[]]
