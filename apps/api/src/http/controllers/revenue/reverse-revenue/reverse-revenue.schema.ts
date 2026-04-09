import { z } from 'zod'

export const reverseRevenueSchema = z.object({
  id: z.coerce.number().int().positive(),
})
