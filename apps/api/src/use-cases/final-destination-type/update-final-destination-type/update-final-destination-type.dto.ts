import type { updateFinalDestinationTypeSchema } from '@/http/controllers/final-destination-type/update-final-destination-type/update-final-destination-type.schema'
import type z from 'zod'

export type UpdateFinalDestinationTypeData = z.infer<typeof updateFinalDestinationTypeSchema>
