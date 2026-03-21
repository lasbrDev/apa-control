import { z } from 'zod'

export const removeOccurrenceTypeSchema = z.object({
  id: z.coerce.number().int().positive(),
})
