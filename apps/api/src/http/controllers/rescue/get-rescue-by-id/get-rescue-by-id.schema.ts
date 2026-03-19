import { z } from 'zod'

export const getRescueByIdSchema = z.object({
  id: z.coerce.number().int().positive('ID deve ser um número positivo'),
})
