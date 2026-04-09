import type { confirmAppointmentsSchema } from '@/http/controllers/appointment/confirm-appointments/confirm-appointments.schema'
import type { z } from 'zod'

export type ConfirmAppointmentsData = z.infer<typeof confirmAppointmentsSchema>
