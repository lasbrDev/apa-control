import { AnimalHistoryTypeValues } from '@/database/schema/enums/animal-history-type'
import { z } from 'zod'

export const getAnimalHistoryByIdSchema = z.object({
  id: z.coerce.number().int().positive('ID deve ser um número positivo'),
})

export const getAnimalHistoryByIdQuerySchema = z
  .object({
    exportType: z.enum(['pdf', 'csv', 'xlsx']).optional(),
    type: z.enum(AnimalHistoryTypeValues).optional(),
    types: z
      .string()
      .optional()
      .transform((value) => {
        if (!value) return undefined
        const parsed = value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
        if (parsed.length === 0) return undefined
        return z.array(z.enum(AnimalHistoryTypeValues)).parse(parsed)
      }),
    startDate: z.string().datetime({ local: true }).optional(),
    endDate: z.string().datetime({ local: true }).optional(),
    employeeId: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true
      return new Date(data.startDate).getTime() <= new Date(data.endDate).getTime()
    },
    {
      message: 'Data inicial deve ser menor ou igual a data final',
      path: ['startDate'],
    },
  )
