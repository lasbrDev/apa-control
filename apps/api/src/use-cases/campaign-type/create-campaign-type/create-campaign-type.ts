import { CampaignType } from '@/entities'
import type { CampaignTypeRepository } from '@/repositories/campaign-type.repository'
import type { CreateCampaignTypeDTO, CreateCampaignTypeData } from './create-campaign-type.dto'

export class CreateCampaignTypeUseCase {
  constructor(private campaignTypeRepository: CampaignTypeRepository) {}

  async execute(data: CreateCampaignTypeData): Promise<CreateCampaignTypeDTO> {
    const campaignType = new CampaignType({
      name: data.name,
      description: data.description,
      category: data.category,
      active: data.active,
      createdAt: new Date(),
    })

    const result = await this.campaignTypeRepository.create(campaignType)

    return { id: result.id }
  }
}
