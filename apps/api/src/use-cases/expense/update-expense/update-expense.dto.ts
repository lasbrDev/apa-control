import type { updateExpenseSchema } from '@/http/controllers/expense/update-expense/update-expense.schema'
import type { z } from 'zod'

export type UpdateExpenseData = z.infer<typeof updateExpenseSchema>
