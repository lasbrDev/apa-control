export const AnimalHistoryType = {
  RESCUE: 'resgate',
  REGISTRATION: 'cadastro',
  CONSULTATION: 'consulta',
  PROCEDURE: 'procedimento',
  OCCURRENCE: 'ocorrencia',
  FINAL_DESTINATION: 'destino_final',
  ADOPTION: 'adocao',
  EXPENSE: 'despesa',
  REVENUE: 'receita',
} as const

export type AnimalHistoryTypeValue = (typeof AnimalHistoryType)[keyof typeof AnimalHistoryType]

export const AnimalHistoryTypeValues = Object.values(AnimalHistoryType) as [
  AnimalHistoryTypeValue,
  ...AnimalHistoryTypeValue[],
]
