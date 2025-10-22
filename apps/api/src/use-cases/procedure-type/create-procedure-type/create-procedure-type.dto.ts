import type { createProcedureTypeSchema } from '@/http/controllers/procedure-type/create-procedure-type/create-procedure-type.schema'
import type z from 'zod'

export type CreateProcedureTypeData = z.infer<typeof createProcedureTypeSchema>

export interface CreateProcedureTypeDTO {
  id: number
}
