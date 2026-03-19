import type { CampaignRepository } from '@/repositories/campaign.repository'
import type { CampaignWithDetails, ListCampaignsData } from './list-campaigns.dto'

export class ListCampaignsUseCase {
  constructor(private campaignRepository: CampaignRepository) {}

  async execute(data: ListCampaignsData): Promise<[number, CampaignWithDetails[]]> {
    return await this.campaignRepository.list(data)
  }
}
