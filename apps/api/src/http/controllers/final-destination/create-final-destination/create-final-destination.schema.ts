import { z } from 'zod'

export const createFinalDestinationSchema = z.object({
  animalId: z.coerce.number().int().positive('Animal é obrigatório'),
  destinationTypeId: z.coerce.number().int().positive('Tipo de destino final é obrigatório'),
  destinationDate: z.string().min(1, 'Data do destino final é obrigatória'),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  observations: z.string().optional().nullable(),
  proof: z.string().optional().nullable(),
})
