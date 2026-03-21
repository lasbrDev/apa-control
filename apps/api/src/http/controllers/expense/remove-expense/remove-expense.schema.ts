import { z } from 'zod'

export const removeExpenseSchema = z.object({
  id: z.coerce.number().int().positive(),
})
