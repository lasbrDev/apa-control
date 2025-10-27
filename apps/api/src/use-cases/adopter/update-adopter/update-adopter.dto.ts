import type { updateAdopterSchema } from '@/http/controllers/adopter/update-adopter/update-adopter.schema'
import type z from 'zod'

export type UpdateAdopterData = z.infer<typeof updateAdopterSchema>
