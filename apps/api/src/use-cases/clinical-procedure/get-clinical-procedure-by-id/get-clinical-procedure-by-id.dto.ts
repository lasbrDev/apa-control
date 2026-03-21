import type { getClinicalProcedureByIdSchema } from '@/http/controllers/clinical-procedure/get-clinical-procedure-by-id/get-clinical-procedure-by-id.schema'
import type { z } from 'zod'

export type GetClinicalProcedureByIdData = z.infer<typeof getClinicalProcedureByIdSchema>
