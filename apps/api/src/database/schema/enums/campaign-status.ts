export const CampaignStatus = {
  ACTIVE: 'ativa',
  COMPLETED: 'concluida',
  CANCELLED: 'cancelada',
} as const

export type CampaignStatusValue = (typeof CampaignStatus)[keyof typeof CampaignStatus]

export const CampaignStatusValues = Object.values(CampaignStatus) as [CampaignStatusValue, ...CampaignStatusValue[]]
