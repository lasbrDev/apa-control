import { z } from 'zod'

export const createOccurrenceSchema = z.object({
  animalId: z.coerce.number().int().positive('Animal é obrigatório'),
  occurrenceTypeId: z.coerce.number().int().positive('Tipo de ocorrência é obrigatório'),
  occurrenceDate: z.string().min(1, 'Data/hora da ocorrência é obrigatória'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  observations: z.string().nullish(),
})
