import { z } from 'zod'

export const removeAdoptionSchema = z.object({
  id: z.coerce.number().int().positive(),
})
