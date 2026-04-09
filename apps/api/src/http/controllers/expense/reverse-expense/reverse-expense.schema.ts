import { z } from 'zod'

export const reverseExpenseSchema = z.object({
  id: z.coerce.number().int().positive(),
})
