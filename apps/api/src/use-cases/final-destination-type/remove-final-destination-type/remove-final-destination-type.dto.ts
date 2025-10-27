import type { removeFinalDestinationTypeSchema } from '@/http/controllers/final-destination-type/remove-final-destination-type/remove-final-destination-type.schema'
import type z from 'zod'

export type RemoveFinalDestinationTypeData = z.infer<typeof removeFinalDestinationTypeSchema>
