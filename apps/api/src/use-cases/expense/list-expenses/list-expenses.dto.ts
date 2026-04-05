import type Decimal from 'decimal.js'

export interface ListExpensesData {
  description?: string
  transactionTypeId?: number
  campaignId?: number
  animalId?: number
  employeeId?: number
  status?: string
  createdAtStart?: string
  createdAtEnd?: string
  page?: number
  perPage?: number
  sort?: Array<{ name: string; order: string }>
  fields?: string[]
}

export type ExpenseWithDetails = {
  id: number
  transactionTypeId: number
  campaignId: number | null
  animalId: number | null
  employeeId: number
  description: string
  value: Decimal
  proof: string | null
  observations: string | null
  status: string
  paymentDate: string | null
  createdAt: Date
  transactionTypeName?: string
  campaignTitle?: string | null
  animalName?: string | null
  employeeName?: string | null
}
