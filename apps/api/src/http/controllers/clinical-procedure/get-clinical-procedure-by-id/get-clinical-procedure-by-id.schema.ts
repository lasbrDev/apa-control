import { z } from 'zod'

export const getClinicalProcedureByIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})
