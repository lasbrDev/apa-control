import type { createAdopterSchema } from '@/http/controllers/adopter/create-adopter/create-adopter.schema'
import type z from 'zod'

export type CreateAdopterData = z.infer<typeof createAdopterSchema>

export interface CreateAdopterDTO {
  id: number
}
