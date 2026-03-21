import type { getAppointmentByIdSchema } from '@/http/controllers/appointment/get-appointment-by-id/get-appointment-by-id.schema'
import type { z } from 'zod'

export type GetAppointmentByIdData = z.infer<typeof getAppointmentByIdSchema>
