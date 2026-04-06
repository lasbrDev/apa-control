import { CampaignRepository } from '@/repositories/campaign.repository'
import { CancelCampaignUseCase } from './cancel-campaign'

export function makeCancelCampaignUseCase() {
  return new CancelCampaignUseCase(new CampaignRepository())
}
