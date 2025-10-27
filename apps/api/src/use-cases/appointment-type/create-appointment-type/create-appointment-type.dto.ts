import type { createAppointmentTypeSchema } from '@/http/controllers/appointment-type/create-appointment-type/create-appointment-type.schema'
import type z from 'zod'

export type CreateAppointmentTypeData = z.infer<typeof createAppointmentTypeSchema>

export interface CreateAppointmentTypeDTO {
  id: number
}
