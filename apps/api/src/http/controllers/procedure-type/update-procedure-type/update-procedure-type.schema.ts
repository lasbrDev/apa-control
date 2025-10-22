import { ProcedureCategoryValues } from '@/database/schema/enums/procedure-category'
import { z } from 'zod'

export const updateProcedureTypeSchema = z.object({
  id: z.number({ error: 'O código do tipo de procedimento é obrigatório.' }),
  name: z.string({ error: 'O nome é obrigatório.' }).trim().max(100, 'O nome deve ter no máximo 100 caracteres.'),
  description: z.string({ error: 'A descrição é obrigatória.' }).trim(),
  category: z.enum(ProcedureCategoryValues, { error: 'A categoria é obrigatória.' }),
  averageCost: z.number({ error: 'O custo médio é obrigatório.' }),
  active: z.coerce.boolean({ error: 'O status é obrigatório.' }),
})
