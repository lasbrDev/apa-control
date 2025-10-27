import { CampaignTypeRepository } from '@/repositories/campaign-type.repository'
import { CreateCampaignTypeUseCase } from '@/use-cases/campaign-type/create-campaign-type/create-campaign-type'

export function makeCreateCampaignTypeUseCase() {
  const campaignTypeRepository = new CampaignTypeRepository()
  const createCampaignTypeUseCase = new CreateCampaignTypeUseCase(campaignTypeRepository)

  return createCampaignTypeUseCase
}
