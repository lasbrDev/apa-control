import type { removeClinicalProcedureSchema } from '@/http/controllers/clinical-procedure/remove-clinical-procedure/remove-clinical-procedure.schema'
import type { z } from 'zod'

export type RemoveClinicalProcedureData = z.infer<typeof removeClinicalProcedureSchema>
