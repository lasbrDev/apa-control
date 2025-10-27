import { CampaignTypeRepository } from '@/repositories/campaign-type.repository'
import { RemoveCampaignTypeUseCase } from '@/use-cases/campaign-type/remove-campaign-type/remove-campaign-type'

export function makeRemoveCampaignTypeUseCase() {
  const campaignTypeRepository = new CampaignTypeRepository()
  const removeCampaignTypeUseCase = new RemoveCampaignTypeUseCase(campaignTypeRepository)

  return removeCampaignTypeUseCase
}
