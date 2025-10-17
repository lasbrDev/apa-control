import { z } from 'zod'

export const apiQueryStringSchema = z.object({
  sort: z
    .string()
    .transform((value) =>
      value.split(',').map((item) => ({ name: item.replace('-', ''), order: item.startsWith('-') ? 'desc' : 'asc' })),
    )
    .optional(),
  fields: z
    .string()
    .transform((value) => value.split(','))
    .optional(),
  page: z.coerce.number().optional(),
  perPage: z.coerce.number().optional(),
})

export type ApiStringQuery = z.infer<typeof apiQueryStringSchema>
