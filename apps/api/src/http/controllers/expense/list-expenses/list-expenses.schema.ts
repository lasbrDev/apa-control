import { TransactionStatusValues } from '@/database/schema/enums/transaction-status'
import { apiQueryStringSchema } from '@/utils/drizzle/api-query-schema'
import { z } from 'zod'

export const listExpensesSchema = apiQueryStringSchema
  .extend({
    description: z.string().optional(),
    transactionTypeId: z.coerce.number().int().positive().optional(),
    campaignId: z.coerce.number().int().positive().optional(),
    animalId: z.coerce.number().int().positive().optional(),
    employeeId: z.coerce.number().int().positive().optional(),
    status: z.enum(TransactionStatusValues).optional(),
    transactionDateStart: z.string().optional(),
    transactionDateEnd: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.transactionDateStart || !data.transactionDateEnd) return true
      return new Date(data.transactionDateStart) <= new Date(data.transactionDateEnd)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['transactionDateEnd'],
    },
  )
