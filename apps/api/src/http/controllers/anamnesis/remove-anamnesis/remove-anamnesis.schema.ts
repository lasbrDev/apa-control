import { z } from 'zod'

export const removeAnamnesisSchema = z.object({
  id: z.coerce.number().int().positive(),
})
