import type { CampaignTypeRepository } from '@/repositories/campaign-type.repository'
import { ApiError } from '@/utils/api-error'
import type { GetCampaignTypeByIdDTO, GetCampaignTypeByIdData } from './get-campaign-type-by-id.dto'

export class GetCampaignTypeByIdUseCase {
  constructor(private campaignTypeRepository: CampaignTypeRepository) {}

  async execute(data: GetCampaignTypeByIdData): Promise<GetCampaignTypeByIdDTO> {
    const campaignType = await this.campaignTypeRepository.findById(data.id)

    if (!campaignType) {
      throw new ApiError('Nenhum tipo de campanha encontrado.', 404)
    }

    return {
      id: campaignType.id,
      name: campaignType.name,
      description: campaignType.description,
      category: campaignType.category,
      active: campaignType.active,
    }
  }
}
