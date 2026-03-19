export const AnimalHistoryType = {
  RESCUE: 'resgate',
  REGISTRATION: 'cadastro',
  CONSULTATION: 'consulta',
  PROCEDURE: 'procedimento',
  FINAL_DESTINATION: 'destino_final',
} as const

export type AnimalHistoryTypeValue = (typeof AnimalHistoryType)[keyof typeof AnimalHistoryType]

export const AnimalHistoryTypeValues = Object.values(AnimalHistoryType) as [
  AnimalHistoryTypeValue,
  ...AnimalHistoryTypeValue[],
]
