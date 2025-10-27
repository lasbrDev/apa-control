import type { getFinalDestinationTypeByIdSchema } from '@/http/controllers/final-destination-type/get-final-destination-type-by-id/get-final-destination-type-by-id.schema'
import type z from 'zod'

export type GetFinalDestinationTypeByIdData = z.infer<typeof getFinalDestinationTypeByIdSchema>

export interface GetFinalDestinationTypeByIdDTO {
  id: number
  name: string
  description: string | null
  requiresApproval: boolean
  active: boolean
}
