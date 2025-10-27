import { z } from 'zod'

export const getAppointmentTypeByIdSchema = z.object({
  id: z.coerce.number(),
})
