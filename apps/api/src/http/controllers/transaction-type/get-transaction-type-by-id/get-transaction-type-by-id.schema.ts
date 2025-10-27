import { z } from 'zod'

export const getTransactionTypeByIdSchema = z.object({
  id: z.coerce.number(),
})
