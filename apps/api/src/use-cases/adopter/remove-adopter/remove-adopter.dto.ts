import type { removeAdopterSchema } from '@/http/controllers/adopter/remove-adopter/remove-adopter.schema'
import type z from 'zod'

export type RemoveAdopterData = z.infer<typeof removeAdopterSchema>
