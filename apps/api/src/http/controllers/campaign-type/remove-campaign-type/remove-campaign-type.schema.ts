import { z } from 'zod'

export const removeCampaignTypeSchema = z.object({ id: z.coerce.number() })
