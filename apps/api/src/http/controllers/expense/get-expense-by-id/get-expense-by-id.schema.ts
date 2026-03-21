import { z } from 'zod'

export const getExpenseByIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})
