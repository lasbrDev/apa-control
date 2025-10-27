import type { updateTransactionTypeSchema } from '@/http/controllers/transaction-type/update-transaction-type/update-transaction-type.schema'
import type z from 'zod'

export type UpdateTransactionTypeData = z.infer<typeof updateTransactionTypeSchema>
