import { CampaignTypeRepository } from '@/repositories/campaign-type.repository'
import { CampaignRepository } from '@/repositories/campaign.repository'
import { CreateCampaignUseCase } from './create-campaign'

export function makeCreateCampaignUseCase() {
  const campaignRepository = new CampaignRepository()
  const campaignTypeRepository = new CampaignTypeRepository()
  return new CreateCampaignUseCase(campaignRepository, campaignTypeRepository)
}
