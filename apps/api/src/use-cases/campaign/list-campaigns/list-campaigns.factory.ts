import { CampaignRepository } from '@/repositories/campaign.repository'
import { ListCampaignsUseCase } from './list-campaigns'

export function makeListCampaignsUseCase() {
  const campaignRepository = new CampaignRepository()
  return new ListCampaignsUseCase(campaignRepository)
}
