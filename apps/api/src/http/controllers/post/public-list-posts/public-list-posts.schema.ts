import { PostTypeValues } from '@/database/schema/enums/post-type'
import { apiQueryStringSchema } from '@/utils/drizzle/api-query-schema'
import { z } from 'zod'

export const publicListPostsSchema = apiQueryStringSchema.extend({
  type: z.enum(PostTypeValues).optional(),
  animalId: z.coerce.number().int().positive().optional(),
  publicationDateStart: z.string().optional(),
  publicationDateEnd: z.string().optional(),
})
