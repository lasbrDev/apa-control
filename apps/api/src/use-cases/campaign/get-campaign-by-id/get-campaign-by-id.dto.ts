import type { CampaignStatusValue } from '@/database/schema/enums/campaign-status'
import type Decimal from 'decimal.js'

export interface GetCampaignByIdData {
  id: number
}

export interface CampaignById {
  id: number
  campaignTypeId: number
  title: string
  description: string
  startDate: string
  endDate: string
  fundraisingGoal: Decimal | null
  status: CampaignStatusValue
  proof: string | null
  observations: string | null
  createdAt: Date
  updatedAt: Date | null
  campaignTypeName: string | null
}
