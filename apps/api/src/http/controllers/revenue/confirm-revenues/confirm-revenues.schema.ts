import { z } from 'zod'

export const confirmRevenuesSchema = z.object({
  ids: z.array(z.coerce.number()).min(1),
})
