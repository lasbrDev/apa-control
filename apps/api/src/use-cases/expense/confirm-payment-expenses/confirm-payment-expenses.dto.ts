import type { confirmPaymentExpensesSchema } from '@/http/controllers/expense/confirm-payment-expenses/confirm-payment-expenses.schema'
import type { z } from 'zod'

export type ConfirmPaymentExpensesData = z.infer<typeof confirmPaymentExpensesSchema>
