import type { createTransactionTypeSchema } from '@/http/controllers/transaction-type/create-transaction-type/create-transaction-type.schema'
import type z from 'zod'

export type CreateTransactionTypeData = z.infer<typeof createTransactionTypeSchema>

export interface CreateTransactionTypeDTO {
  id: number
}
