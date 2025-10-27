import type { getCampaignTypeByIdSchema } from '@/http/controllers/campaign-type/get-campaign-type-by-id/get-campaign-type-by-id.schema'
import type z from 'zod'

export type GetCampaignTypeByIdData = z.infer<typeof getCampaignTypeByIdSchema>

export interface GetCampaignTypeByIdDTO {
  id: number
  name: string
  description: string | null
  category: string
  active: boolean
}
