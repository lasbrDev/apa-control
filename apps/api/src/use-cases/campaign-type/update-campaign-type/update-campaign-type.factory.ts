import { CampaignTypeRepository } from '@/repositories/campaign-type.repository'
import { UpdateCampaignTypeUseCase } from '@/use-cases/campaign-type/update-campaign-type/update-campaign-type'

export function makeUpdateCampaignTypeUseCase() {
  const campaignTypeRepository = new CampaignTypeRepository()
  const updateCampaignTypeUseCase = new UpdateCampaignTypeUseCase(campaignTypeRepository)

  return updateCampaignTypeUseCase
}
