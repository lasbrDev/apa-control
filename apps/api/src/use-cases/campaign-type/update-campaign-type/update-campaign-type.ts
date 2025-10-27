import type { CampaignTypeRepository } from '@/repositories/campaign-type.repository'
import { ApiError } from '@/utils/api-error'
import type { UpdateCampaignTypeData } from './update-campaign-type.dto'

export class UpdateCampaignTypeUseCase {
  constructor(private campaignTypeRepository: CampaignTypeRepository) {}

  async execute(data: UpdateCampaignTypeData): Promise<void> {
    const oldData = await this.campaignTypeRepository.findById(data.id)

    if (!oldData) {
      throw new ApiError('Tipo de campanha não encontrado.', 404)
    }

    await this.campaignTypeRepository.update(data.id, {
      name: data.name,
      description: data.description,
      category: data.category,
      active: data.active,
    })
  }
}
