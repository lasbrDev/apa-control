import { z } from 'zod'

export const getAnamnesisByIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})
