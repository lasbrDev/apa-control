import { CampaignRepository } from '@/repositories/campaign.repository'
import { CompleteCampaignUseCase } from './complete-campaign'

export function makeCompleteCampaignUseCase() {
  return new CompleteCampaignUseCase(new CampaignRepository())
}
