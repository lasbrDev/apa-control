export const CampaignCategory = {
  DONATION: 'doacao',
  RAFFLE: 'rifa',
  EVENT: 'evento',
  SPONSORSHIP: 'patrocinio',
} as const

export type CampaignCategoryValue = (typeof CampaignCategory)[keyof typeof CampaignCategory]

export const CampaignCategoryValues = Object.values(CampaignCategory) as [string, ...string[]]
