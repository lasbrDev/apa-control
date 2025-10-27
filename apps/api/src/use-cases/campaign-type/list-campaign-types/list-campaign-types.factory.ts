import { CampaignTypeRepository } from '@/repositories/campaign-type.repository'
import { ListCampaignTypesUseCase } from '@/use-cases/campaign-type/list-campaign-types/list-campaign-types'

export function makeListCampaignTypesUseCase() {
  const campaignTypeRepository = new CampaignTypeRepository()
  const listCampaignTypesUseCase = new ListCampaignTypesUseCase(campaignTypeRepository)

  return listCampaignTypesUseCase
}
