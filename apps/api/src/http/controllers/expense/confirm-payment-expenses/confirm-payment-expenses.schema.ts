import { z } from 'zod'

export const confirmPaymentExpensesSchema = z.object({
  ids: z.array(z.coerce.number()).min(1),
})
