import { CampaignTypeRepository } from '@/repositories/campaign-type.repository'
import { CampaignRepository } from '@/repositories/campaign.repository'
import { UpdateCampaignUseCase } from './update-campaign'

export function makeUpdateCampaignUseCase() {
  const campaignRepository = new CampaignRepository()
  const campaignTypeRepository = new CampaignTypeRepository()
  return new UpdateCampaignUseCase(campaignRepository, campaignTypeRepository)
}
