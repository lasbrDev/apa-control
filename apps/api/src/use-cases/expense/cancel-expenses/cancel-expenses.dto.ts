import type { cancelExpensesSchema } from '@/http/controllers/expense/cancel-expenses/cancel-expenses.schema'
import type { z } from 'zod'

export type CancelExpensesData = z.infer<typeof cancelExpensesSchema>
