import type { updateProcedureTypeSchema } from '@/http/controllers/procedure-type/update-procedure-type/update-procedure-type.schema'
import type z from 'zod'

export type UpdateProcedureTypeData = z.infer<typeof updateProcedureTypeSchema>
