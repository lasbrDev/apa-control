import type { CampaignRepository } from '@/repositories/campaign.repository'
import type { CampaignById, GetCampaignByIdData } from './get-campaign-by-id.dto'

export class GetCampaignByIdUseCase {
  constructor(private campaignRepository: CampaignRepository) {}

  async execute(data: GetCampaignByIdData): Promise<CampaignById> {
    return await this.campaignRepository.findByIdOrThrow(data.id)
  }
}
