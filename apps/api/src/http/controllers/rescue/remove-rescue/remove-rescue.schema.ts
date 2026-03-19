import { z } from 'zod'

export const removeRescueSchema = z.object({
  id: z.coerce.number().int().positive('ID deve ser um número positivo'),
})
