import type { createCampaignTypeSchema } from '@/http/controllers/campaign-type/create-campaign-type/create-campaign-type.schema'
import type z from 'zod'

export type CreateCampaignTypeData = z.infer<typeof createCampaignTypeSchema>

export interface CreateCampaignTypeDTO {
  id: number
}
