import { apiQueryStringSchema } from '@/utils/drizzle/api-query-schema'
import { z } from 'zod'

export const listOccurrencesSchema = apiQueryStringSchema.extend({
  animalName: z.string().optional(),
  occurrenceTypeId: z.coerce.number().int().positive().optional(),
  employeeId: z.coerce.number().int().positive().optional(),
  occurrenceDateStart: z.string().optional(),
  occurrenceDateEnd: z.string().optional(),
})
