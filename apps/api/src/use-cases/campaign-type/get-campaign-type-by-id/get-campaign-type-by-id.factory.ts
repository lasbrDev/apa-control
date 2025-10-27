import { CampaignTypeRepository } from '@/repositories/campaign-type.repository'
import { GetCampaignTypeByIdUseCase } from '@/use-cases/campaign-type/get-campaign-type-by-id/get-campaign-type-by-id'

export function makeGetCampaignTypeByIdUseCase() {
  const campaignTypeRepository = new CampaignTypeRepository()
  const getCampaignTypeByIdUseCase = new GetCampaignTypeByIdUseCase(campaignTypeRepository)

  return getCampaignTypeByIdUseCase
}
