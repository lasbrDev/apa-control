import type { getAnamnesisByIdSchema } from '@/http/controllers/anamnesis/get-anamnesis-by-id/get-anamnesis-by-id.schema'
import type { z } from 'zod'

export type GetAnamnesisByIdData = z.infer<typeof getAnamnesisByIdSchema>
