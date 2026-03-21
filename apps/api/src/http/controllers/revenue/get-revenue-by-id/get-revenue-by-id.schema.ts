import { z } from 'zod'

export const getRevenueByIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})
