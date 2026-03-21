import { z } from 'zod'

export const removeRevenueSchema = z.object({
  id: z.coerce.number().int().positive(),
})
