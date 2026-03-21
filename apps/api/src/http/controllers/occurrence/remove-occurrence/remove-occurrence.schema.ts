import { z } from 'zod'

export const removeOccurrenceSchema = z.object({
  id: z.coerce.number().int().positive(),
})
