import type { removeAdoptionSchema } from '@/http/controllers/adoption/remove-adoption/remove-adoption.schema'
import type { z } from 'zod'

export type RemoveAdoptionData = z.infer<typeof removeAdoptionSchema>
