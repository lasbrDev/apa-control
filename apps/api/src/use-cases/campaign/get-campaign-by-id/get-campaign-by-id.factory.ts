import { CampaignRepository } from '@/repositories/campaign.repository'
import { GetCampaignByIdUseCase } from './get-campaign-by-id'

export function makeGetCampaignByIdUseCase() {
  const campaignRepository = new CampaignRepository()
  return new GetCampaignByIdUseCase(campaignRepository)
}
