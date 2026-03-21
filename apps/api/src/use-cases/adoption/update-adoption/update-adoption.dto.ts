import type { updateAdoptionSchema } from '@/http/controllers/adoption/update-adoption/update-adoption.schema'
import type { z } from 'zod'

export type UpdateAdoptionData = z.infer<typeof updateAdoptionSchema>
