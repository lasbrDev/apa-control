import type { createFinalDestinationTypeSchema } from '@/http/controllers/final-destination-type/create-final-destination-type/create-final-destination-type.schema'
import type z from 'zod'

export type CreateFinalDestinationTypeData = z.infer<typeof createFinalDestinationTypeSchema>

export interface CreateFinalDestinationTypeDTO {
  id: number
}
