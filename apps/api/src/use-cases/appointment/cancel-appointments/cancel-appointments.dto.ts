import type { cancelAppointmentsSchema } from '@/http/controllers/appointment/cancel-appointments/cancel-appointments.schema'
import type { z } from 'zod'

export type CancelAppointmentsData = z.infer<typeof cancelAppointmentsSchema>
