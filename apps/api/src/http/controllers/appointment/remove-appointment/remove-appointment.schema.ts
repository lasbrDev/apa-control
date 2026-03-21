import { z } from 'zod'

export const removeAppointmentSchema = z.object({
  id: z.coerce.number().int().positive(),
})
