import { z } from 'zod'

export const getAppointmentByIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})
