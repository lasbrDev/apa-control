export interface UpdateCampaignData {
  id: number
  campaignTypeId: number
  title: string
  description: string
  startDate: string
  endDate: string
  fundraisingGoal?: number | null
  observations?: string | null
}
