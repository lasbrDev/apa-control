import { z } from 'zod'

export const getProcedureTypeByIdSchema = z.object({
  id: z.coerce.number(),
})
