import type { getProcedureTypeByIdSchema } from '@/http/controllers/procedure-type/get-procedure-type-by-id/get-procedure-type-by-id.schema'
import type z from 'zod'

export type GetProcedureTypeByIdData = z.infer<typeof getProcedureTypeByIdSchema>

export interface GetProcedureTypeByIdDTO {
  id: number
  name: string
  description: string | null
  category: string
  averageCost: number
  active: boolean
}
