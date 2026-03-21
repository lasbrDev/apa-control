import type { confirmAdoptionSchema } from '@/http/controllers/adoption/confirm-adoption/confirm-adoption.schema'
import type { z } from 'zod'

export type ConfirmAdoptionData = z.infer<typeof confirmAdoptionSchema> & {
  employeeId: number
}
