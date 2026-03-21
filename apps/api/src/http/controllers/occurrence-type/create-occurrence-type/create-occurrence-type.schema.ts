import { z } from 'zod'

export const createOccurrenceTypeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional().nullable(),
  active: z.coerce.boolean().optional(),
})
