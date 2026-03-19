import { apiQueryStringSchema } from '@/utils/drizzle/api-query-schema'
import { z } from 'zod'

export const listRescuesSchema = apiQueryStringSchema
  .extend({
    locationFound: z.string().optional(),
    animalName: z.string().optional(),
    rescueDateStart: z.string().min(1, 'Data inicial do resgate é obrigatória'),
    rescueDateEnd: z.string().min(1, 'Data final do resgate é obrigatória'),
  })
  .refine(
    (data) => {
      if (!data.rescueDateStart || !data.rescueDateEnd) return true
      return new Date(data.rescueDateStart) <= new Date(data.rescueDateEnd)
    },
    {
      message: 'A data inicial do resgate deve ser menor ou igual à data final.',
      path: ['rescueDateEnd'],
    },
  )
