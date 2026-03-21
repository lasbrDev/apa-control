import type { cancelAdoptionSchema } from '@/http/controllers/adoption/cancel-adoption/cancel-adoption.schema'
import type { z } from 'zod'

export type CancelAdoptionData = z.infer<typeof cancelAdoptionSchema> & {
  employeeId: number
}
