export const ProcedureCategory = {
  CLINICAL: 'clinico',
  SURGICAL: 'cirurgico',
  EXAM: 'exame',
  VACCINE: 'vacina',
} as const

export type ProcedureCategoryValue = (typeof ProcedureCategory)[keyof typeof ProcedureCategory]

export const ProcedureCategoryValues = Object.values(ProcedureCategory) as [string, ...string[]]
