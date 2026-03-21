import type { updateClinicalProcedureSchema } from '@/http/controllers/clinical-procedure/update-clinical-procedure/update-clinical-procedure.schema'
import type { z } from 'zod'

export type UpdateClinicalProcedureData = z.infer<typeof updateClinicalProcedureSchema>
