import { z } from 'zod'

const filterItemSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number(), z.date(), z.boolean(), z.array(z.string()), z.array(z.number())]).nullable(),
  comparer: z
    .enum([
      'Equals',
      'NotEquals',
      'Contains',
      'NotContains',
      'LessThan',
      'LessThanOrEqual',
      'GreaterThan',
      'GreaterThanOrEqual',
      'Like',
    ])
    .optional(),
})

export const apiQuerySchema = z.object({
  filters: z
    .array(z.object({ kind: z.enum(['and', 'or']).optional(), items: z.array(filterItemSchema) }).nullish())
    .optional(),
  sort: z.array(z.object({ name: z.string(), order: z.enum(['ASC', 'DESC']).optional() })).optional(),
  fields: z.array(z.string()).nullish(),
  page: z.number().default(1),
  perPage: z.number().default(10),
  usePager: z.boolean().default(true),
})

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
  exportType: z.enum(['csv', 'xlsx', 'pdf']).optional(),
})

export type ApiQuery = z.infer<typeof apiQuerySchema>
export type ApiStringQuery = z.infer<typeof apiQueryStringSchema>
export type FilterItem = z.infer<typeof filterItemSchema>
