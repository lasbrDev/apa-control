import { z } from 'zod'

export const updateOccurrenceTypeSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional().nullable(),
  active: z.coerce.boolean(),
})
