import { PostStatusValues } from '@/database/schema/enums/post-status'
import { PostTypeValues } from '@/database/schema/enums/post-type'
import { apiQueryStringSchema } from '@/utils/drizzle/api-query-schema'
import { z } from 'zod'

export const listPostsSchema = apiQueryStringSchema
  .extend({
    title: z.string().optional(),
    type: z.enum(PostTypeValues).optional(),
    status: z.enum(PostStatusValues).optional(),
    employeeId: z.coerce.number().int().positive().optional(),
    publicationDateStart: z.string().optional(),
    publicationDateEnd: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.publicationDateStart || !data.publicationDateEnd) return true
      return new Date(data.publicationDateStart) <= new Date(data.publicationDateEnd)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['publicationDateEnd'],
    },
  )
