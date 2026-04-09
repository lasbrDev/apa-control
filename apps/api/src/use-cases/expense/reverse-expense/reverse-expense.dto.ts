import type { reverseExpenseSchema } from '@/http/controllers/expense/reverse-expense/reverse-expense.schema'
import type { z } from 'zod'

export type ReverseExpenseData = z.infer<typeof reverseExpenseSchema>
