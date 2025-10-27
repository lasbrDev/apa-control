import type { CampaignTypeRepository } from '@/repositories'
import type { ListCampaignTypesDTO } from './list-campaign-types.dto'

export class ListCampaignTypesUseCase {
  constructor(private campaignTypeRepository: CampaignTypeRepository) {}

  async execute(): Promise<ListCampaignTypesDTO[]> {
    const items = await this.campaignTypeRepository.list()
    return items
  }
}
