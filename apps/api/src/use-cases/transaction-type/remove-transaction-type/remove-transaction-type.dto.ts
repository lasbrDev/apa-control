import type { removeTransactionTypeSchema } from '@/http/controllers/transaction-type/remove-transaction-type/remove-transaction-type.schema'
import type z from 'zod'

export type RemoveTransactionTypeData = z.infer<typeof removeTransactionTypeSchema>
