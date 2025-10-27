import type { removeCampaignTypeSchema } from '@/http/controllers/campaign-type/remove-campaign-type/remove-campaign-type.schema'
import type z from 'zod'

export type RemoveCampaignTypeData = z.infer<typeof removeCampaignTypeSchema>
