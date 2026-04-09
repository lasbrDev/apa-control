import { z } from 'zod'

export const confirmAppointmentsSchema = z.object({
  ids: z.array(z.coerce.number()).min(1),
})
