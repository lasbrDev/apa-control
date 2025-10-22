import { z } from 'zod'

export const removeProcedureTypeSchema = z.object({ id: z.coerce.number() })
