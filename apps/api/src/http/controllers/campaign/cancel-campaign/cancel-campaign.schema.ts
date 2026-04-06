import { z } from 'zod'

export const cancelCampaignSchema = z.object({
  id: z.coerce.number().int().positive('ID deve ser um número positivo'),
})
