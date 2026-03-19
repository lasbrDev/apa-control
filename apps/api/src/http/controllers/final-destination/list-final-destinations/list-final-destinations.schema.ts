import { apiQueryStringSchema } from '@/utils/drizzle/api-query-schema'
import { z } from 'zod'

export const listFinalDestinationsSchema = apiQueryStringSchema
  .extend({
    animalName: z.string().optional(),
    destinationTypeId: z.coerce.number().int().positive().optional(),
    employeeId: z.coerce.number().int().positive().optional(),
    destinationDateStart: z.string().optional(),
    destinationDateEnd: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.destinationDateStart || !data.destinationDateEnd) return true
      return new Date(data.destinationDateStart) <= new Date(data.destinationDateEnd)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['destinationDateEnd'],
    },
  )
