import { z } from 'zod'

export const cancelExpensesSchema = z.object({
  ids: z.array(z.coerce.number()).min(1),
})
