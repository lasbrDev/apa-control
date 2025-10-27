import type { getAppointmentTypeByIdSchema } from '@/http/controllers/appointment-type/get-appointment-type-by-id/get-appointment-type-by-id.schema'
import type z from 'zod'

export type GetAppointmentTypeByIdData = z.infer<typeof getAppointmentTypeByIdSchema>

export interface GetAppointmentTypeByIdDTO {
  id: number
  name: string
  description: string | null
  urgency: string
  active: boolean
}
