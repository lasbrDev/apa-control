import { z } from 'zod'

export const removePostSchema = z.object({
  id: z.coerce.number().int().positive(),
})
