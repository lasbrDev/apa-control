import type { CampaignStatusValue } from '@/database/schema/enums/campaign-status'
import type Decimal from 'decimal.js'

export interface ListCampaignsData {
  title?: string
  status?: CampaignStatusValue
  campaignTypeId?: number
  startDate?: string
  endDate?: string
  page?: number
  perPage?: number
  sort?: Array<{ name: string; order: string }>
  fields?: string[]
}

export interface CampaignWithDetails {
  id: number
  campaignTypeId: number
  title: string
  description: string
  startDate: string
  endDate: string
  fundraisingGoal: Decimal
  status: CampaignStatusValue
  observations: string | null
  createdAt: Date
  updatedAt: Date | null
  campaignTypeName?: string
}
