import { z } from 'zod'

export const confirmAdoptionsSchema = z.object({
  ids: z.array(z.coerce.number()).min(1),
})
