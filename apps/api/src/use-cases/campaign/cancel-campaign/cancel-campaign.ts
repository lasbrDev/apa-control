import { CampaignStatus } from '@/database/schema/enums/campaign-status'
import type { CampaignRepository } from '@/repositories/campaign.repository'
import { ApiError } from '@/utils/api-error'
import type { CancelCampaignData } from './cancel-campaign.dto'

export class CancelCampaignUseCase {
  constructor(private campaignRepository: CampaignRepository) {}

  async execute({ id }: CancelCampaignData): Promise<void> {
    const campaign = await this.campaignRepository.findByIdOrThrow(id)

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new ApiError('Apenas campanhas ativas podem ser canceladas.', 400)
    }

    await this.campaignRepository.update(id, {
      status: CampaignStatus.CANCELLED,
      updatedAt: new Date(),
    })
  }
}
