import { z } from 'zod'

export const cancelAdoptionSchema = z.object({
  id: z.coerce.number().int().positive('ID deve ser um número positivo'),
  reason: z.string().min(1, 'Motivo é obrigatório'),
})
