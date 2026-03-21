import type { createAdoptionSchema } from '@/http/controllers/adoption/create-adoption/create-adoption.schema'
import type { z } from 'zod'

export type CreateAdoptionData = z.infer<typeof createAdoptionSchema>
