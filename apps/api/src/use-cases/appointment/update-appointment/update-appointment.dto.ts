import type { updateAppointmentSchema } from '@/http/controllers/appointment/update-appointment/update-appointment.schema'
import type { z } from 'zod'

export type UpdateAppointmentData = z.infer<typeof updateAppointmentSchema>
