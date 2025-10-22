import type Decimal from 'decimal.js'

export type ListProcedureTypesDTO = {
  id: number
  name: string
  category: string
  averageCost: Decimal
  active: boolean
}
