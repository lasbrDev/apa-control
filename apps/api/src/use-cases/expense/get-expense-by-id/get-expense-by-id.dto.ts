import type { getExpenseByIdSchema } from '@/http/controllers/expense/get-expense-by-id/get-expense-by-id.schema'
import type { z } from 'zod'

export type GetExpenseByIdData = z.infer<typeof getExpenseByIdSchema>
