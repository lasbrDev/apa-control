import { z } from 'zod'

export const cancelRevenuesSchema = z.object({
  ids: z.array(z.coerce.number()).min(1),
})
