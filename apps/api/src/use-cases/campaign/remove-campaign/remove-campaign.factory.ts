import { CampaignRepository } from '@/repositories/campaign.repository'
import { RemoveCampaignUseCase } from './remove-campaign'

export function makeRemoveCampaignUseCase() {
  const campaignRepository = new CampaignRepository()
  return new RemoveCampaignUseCase(campaignRepository)
}
