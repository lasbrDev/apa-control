export const ConsultationType = {
  CLINICAL: 'clinica',
  HOME: 'domiciliar',
  EMERGENCY: 'emergencia',
} as const

export type ConsultationTypeValue = (typeof ConsultationType)[keyof typeof ConsultationType]

export const ConsultationTypeValues = Object.values(ConsultationType) as [string, ...string[]]
