import type { getAdoptionByIdSchema } from '@/http/controllers/adoption/get-adoption-by-id/get-adoption-by-id.schema'
import type { z } from 'zod'

export type GetAdoptionByIdData = z.infer<typeof getAdoptionByIdSchema>
