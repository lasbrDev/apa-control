import type { updateAppointmentTypeSchema } from '@/http/controllers/appointment-type/update-appointment-type/update-appointment-type.schema'
import type z from 'zod'

export type UpdateAppointmentTypeData = z.infer<typeof updateAppointmentTypeSchema>
