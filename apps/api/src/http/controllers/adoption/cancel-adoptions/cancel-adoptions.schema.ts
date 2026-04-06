import { z } from 'zod'

export const cancelAdoptionsSchema = z.object({
  ids: z.array(z.coerce.number()).min(1),
})
