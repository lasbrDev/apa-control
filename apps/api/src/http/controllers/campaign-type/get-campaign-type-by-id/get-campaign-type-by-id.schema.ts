import { z } from 'zod'

export const getCampaignTypeByIdSchema = z.object({
  id: z.coerce.number(),
})
