import { apiQueryStringSchema } from '@/utils/drizzle/api-query-schema'
import { z } from 'zod'

export const listAnamnesesSchema = apiQueryStringSchema
  .extend({
    animalName: z.string().optional(),
    employeeId: z.coerce.number().int().positive().optional(),
    createdDateStart: z.string().min(1, 'Data inicial é obrigatória.'),
    createdDateEnd: z.string().min(1, 'Data final é obrigatória.'),
  })
  .refine(
    (data) => {
      if (!data.createdDateStart || !data.createdDateEnd) return true
      return new Date(data.createdDateStart) <= new Date(data.createdDateEnd)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['createdDateEnd'],
    },
  )
