import type { CampaignRepository } from '@/repositories/campaign.repository'
import { ApiError } from '@/utils/api-error'
import type { RemoveCampaignData } from './remove-campaign.dto'

export class RemoveCampaignUseCase {
  constructor(private campaignRepository: CampaignRepository) {}

  async execute(data: RemoveCampaignData): Promise<void> {
    const campaign = await this.campaignRepository.findById(data.id)
    if (!campaign) throw new ApiError('Campanha não encontrada.', 404)

    await this.campaignRepository.delete(data.id)
  }
}
