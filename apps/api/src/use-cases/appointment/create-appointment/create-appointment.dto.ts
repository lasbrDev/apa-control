import type { createAppointmentSchema } from '@/http/controllers/appointment/create-appointment/create-appointment.schema'
import type { z } from 'zod'

export type CreateAppointmentData = z.infer<typeof createAppointmentSchema>
