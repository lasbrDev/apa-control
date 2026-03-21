import type { createExpenseSchema } from '@/http/controllers/expense/create-expense/create-expense.schema'
import type { z } from 'zod'

export type CreateExpenseData = z.infer<typeof createExpenseSchema>
