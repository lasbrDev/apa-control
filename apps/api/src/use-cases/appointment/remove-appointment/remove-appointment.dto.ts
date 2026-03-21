import type { removeAppointmentSchema } from '@/http/controllers/appointment/remove-appointment/remove-appointment.schema'
import type { z } from 'zod'

export type RemoveAppointmentData = z.infer<typeof removeAppointmentSchema>
