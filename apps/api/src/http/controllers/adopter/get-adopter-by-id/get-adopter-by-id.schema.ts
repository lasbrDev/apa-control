import { z } from 'zod'

export const getAdopterByIdSchema = z.object({
  id: z.coerce.number(),
})
