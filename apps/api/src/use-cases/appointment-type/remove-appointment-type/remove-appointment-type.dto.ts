import type { removeAppointmentTypeSchema } from '@/http/controllers/appointment-type/remove-appointment-type/remove-appointment-type.schema'
import type z from 'zod'

export type RemoveAppointmentTypeData = z.infer<typeof removeAppointmentTypeSchema>
