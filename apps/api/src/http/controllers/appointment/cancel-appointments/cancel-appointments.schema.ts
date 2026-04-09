import { z } from 'zod'

export const cancelAppointmentsSchema = z.object({
  ids: z.array(z.coerce.number()).min(1),
})
