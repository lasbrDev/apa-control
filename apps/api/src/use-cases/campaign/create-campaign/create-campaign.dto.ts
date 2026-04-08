export interface CreateCampaignData {
  campaignTypeId: number
  title: string
  description: string
  startDate: string
  endDate: string
  fundraisingGoal?: number | null
  proof?: string | null
  observations?: string | null
}
