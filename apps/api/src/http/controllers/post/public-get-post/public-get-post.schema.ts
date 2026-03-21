import { z } from 'zod'

export const publicGetPostSchema = z.object({
  id: z.coerce.number().int().positive(),
})
