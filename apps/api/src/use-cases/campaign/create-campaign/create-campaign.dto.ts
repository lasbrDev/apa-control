import type { CampaignStatusValue } from '@/database/schema/enums/campaign-status'

export interface CreateCampaignData {
  campaignTypeId: number
  title: string
  description: string
  startDate: string
  endDate: string
  fundraisingGoal: number
  status: CampaignStatusValue
  observations?: string | null
}
