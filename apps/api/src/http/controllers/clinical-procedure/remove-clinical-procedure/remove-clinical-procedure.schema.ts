import { z } from 'zod'

export const removeClinicalProcedureSchema = z.object({
  id: z.coerce.number().int().positive(),
})
