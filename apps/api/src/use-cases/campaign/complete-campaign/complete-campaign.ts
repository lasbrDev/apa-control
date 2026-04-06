import { CampaignStatus } from '@/database/schema/enums/campaign-status'
import type { CampaignRepository } from '@/repositories/campaign.repository'
import { ApiError } from '@/utils/api-error'
import type { CompleteCampaignData } from './complete-campaign.dto'

export class CompleteCampaignUseCase {
  constructor(private campaignRepository: CampaignRepository) {}

  async execute({ id }: CompleteCampaignData): Promise<void> {
    const campaign = await this.campaignRepository.findByIdOrThrow(id)

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new ApiError('Apenas campanhas ativas podem ser concluídas.', 400)
    }

    await this.campaignRepository.update(id, {
      status: CampaignStatus.COMPLETED,
      updatedAt: new Date(),
    })
  }
}
