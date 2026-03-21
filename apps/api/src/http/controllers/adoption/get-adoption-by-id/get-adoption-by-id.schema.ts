import { z } from 'zod'

export const getAdoptionByIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})
