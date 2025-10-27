import { apiQueryStringSchema } from '@/utils/drizzle/api-query-schema'
import { z } from 'zod'

export const listVeterinaryClinicsSchema = apiQueryStringSchema.extend({
  name: z.string().nullish(),
  cnpj: z.string().nullish(),
  phone: z.string().nullish(),
  responsible: z.string().nullish(),
  active: z.enum(['true', 'false']).nullish(),
})
