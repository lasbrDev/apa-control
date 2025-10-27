import { z } from 'zod'

export const createFinalDestinationTypeSchema = z.object({
  name: z.string({ error: 'O nome é obrigatório.' }).trim().max(100, 'O nome deve ter no máximo 100 caracteres.'),
  description: z.string({ error: 'A descrição é obrigatória.' }),
  requiresApproval: z.coerce.boolean({ error: 'O requer aprovação é obrigatório.' }),
  active: z.coerce.boolean({ error: 'O status é obrigatório.' }),
})
