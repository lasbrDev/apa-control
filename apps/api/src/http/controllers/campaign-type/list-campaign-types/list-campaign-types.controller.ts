import { makeListCampaignTypesUseCase } from '@/use-cases/campaign-type/list-campaign-types/list-campaign-types.factory'

export async function listCampaignTypesController() {
  const listCampaignTypesUseCase = makeListCampaignTypesUseCase()
  const result = await listCampaignTypesUseCase.execute()
  return result
}
