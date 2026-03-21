import { z } from 'zod'

export const getPostByIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})
