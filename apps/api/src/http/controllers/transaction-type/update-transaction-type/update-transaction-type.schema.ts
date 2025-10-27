import { TransactionCategoryValues } from '@/database/schema/enums/transaction-category'
import { z } from 'zod'

export const updateTransactionTypeSchema = z.object({
  id: z.number({ error: 'O código do tipo de transação é obrigatório.' }),
  name: z.string({ error: 'O nome é obrigatório.' }).trim().max(100, 'O nome deve ter no máximo 100 caracteres.'),
  category: z.enum(TransactionCategoryValues, { error: 'A categoria é obrigatória.' }),
  description: z.string({ error: 'A descrição é obrigatória.' }).trim(),
  active: z.coerce.boolean({ error: 'O status é obrigatório.' }),
})
