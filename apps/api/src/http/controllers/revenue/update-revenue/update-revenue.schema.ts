import { TransactionStatusValues } from '@/database/schema/enums/transaction-status'
import { z } from 'zod'

const optionalId = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : v),
  z.union([z.coerce.number().int().positive(), z.null()]),
)

export const updateRevenueSchema = z.object({
  id: z.coerce.number().int().positive('ID deve ser um número positivo'),
  transactionTypeId: z.coerce.number().int().positive('Tipo de receita é obrigatório'),
  campaignId: optionalId,
  animalId: optionalId,
  description: z.string().min(1, 'Descrição é obrigatória').max(200),
  value: z.coerce.number().nonnegative('Valor deve ser maior ou igual a zero'),
  transactionDate: z.string().min(1, 'Data é obrigatória'),
  observations: z.string().optional().nullable(),
  status: z.enum(TransactionStatusValues),
  proof: z.string().optional().nullable(),
})
