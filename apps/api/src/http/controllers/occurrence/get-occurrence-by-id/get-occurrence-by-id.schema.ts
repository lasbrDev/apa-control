import { z } from 'zod'

export const getOccurrenceByIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})
