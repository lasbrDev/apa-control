import type { getTransactionTypeByIdSchema } from '@/http/controllers/transaction-type/get-transaction-type-by-id/get-transaction-type-by-id.schema'
import type z from 'zod'

export type GetTransactionTypeByIdData = z.infer<typeof getTransactionTypeByIdSchema>

export interface GetTransactionTypeByIdDTO {
  id: number
  name: string
  category: string
  description: string | null
  active: boolean
}
