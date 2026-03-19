import { z } from 'zod'

export const updateRescueSchema = z.object({
  id: z.number().int().positive('ID deve ser um número positivo'),
  rescueDate: z.string().min(1, 'Data do resgate é obrigatória'),
  locationFound: z.string().min(1, 'Local encontrado é obrigatório').max(200),
  circumstances: z.string().min(1, 'Circunstâncias são obrigatórias'),
  foundConditions: z.string().min(1, 'Condições em que foi encontrado é obrigatório'),
  immediateProcedures: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
})
