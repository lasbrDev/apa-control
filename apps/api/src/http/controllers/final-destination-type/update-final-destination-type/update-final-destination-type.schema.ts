import { z } from 'zod'

export const updateFinalDestinationTypeSchema = z.object({
  id: z.number({ error: 'O código do tipo de destino final é obrigatório.' }),
  name: z.string({ error: 'O nome é obrigatório.' }).trim().max(100, 'O nome deve ter no máximo 100 caracteres.'),
  description: z.string({ error: 'A descrição é obrigatória.' }).trim(),
  active: z.coerce.boolean({ error: 'O status é obrigatório.' }),
})
