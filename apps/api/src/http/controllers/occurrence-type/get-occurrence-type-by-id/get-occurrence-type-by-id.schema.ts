import { z } from 'zod'

export const getOccurrenceTypeByIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})
