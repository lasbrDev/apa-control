import type { removeExpenseSchema } from '@/http/controllers/expense/remove-expense/remove-expense.schema'
import type { z } from 'zod'

export type RemoveExpenseData = z.infer<typeof removeExpenseSchema>
