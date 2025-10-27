import type { updateCampaignTypeSchema } from '@/http/controllers/campaign-type/update-campaign-type/update-campaign-type.schema'
import type z from 'zod'

export type UpdateCampaignTypeData = z.infer<typeof updateCampaignTypeSchema>
