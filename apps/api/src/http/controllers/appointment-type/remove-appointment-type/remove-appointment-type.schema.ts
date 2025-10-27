import { z } from 'zod'

export const removeAppointmentTypeSchema = z.object({ id: z.coerce.number() })
