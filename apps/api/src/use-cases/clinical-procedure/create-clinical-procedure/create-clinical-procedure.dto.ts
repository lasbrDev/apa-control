import type { createClinicalProcedureSchema } from '@/http/controllers/clinical-procedure/create-clinical-procedure/create-clinical-procedure.schema'
import type { z } from 'zod'

export type CreateClinicalProcedureData = z.infer<typeof createClinicalProcedureSchema>
