import type { removeProcedureTypeSchema } from '@/http/controllers/procedure-type/remove-procedure-type/remove-procedure-type.schema'
import type z from 'zod'

export type RemoveProcedureTypeData = z.infer<typeof removeProcedureTypeSchema>
