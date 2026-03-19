import { z } from 'zod'

export const getCampaignByIdSchema = z.object({
  id: z.coerce.number().int().positive('ID deve ser um número positivo'),
})
