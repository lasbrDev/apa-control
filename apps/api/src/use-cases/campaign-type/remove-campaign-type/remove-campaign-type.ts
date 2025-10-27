import type { DrizzleTransaction } from '@/database/types'
import type { CampaignTypeRepository } from '@/repositories/campaign-type.repository'
import { ApiError } from '@/utils/api-error'
import type { RemoveCampaignTypeData } from './remove-campaign-type.dto'

export class RemoveCampaignTypeUseCase {
  constructor(private campaignTypeRepository: CampaignTypeRepository) {}

  async execute(data: RemoveCampaignTypeData, dbTransaction: DrizzleTransaction) {
    const campaignType = await this.campaignTypeRepository.findById(data.id)

    if (!campaignType) {
      throw new ApiError('Nenhum tipo de campanha encontrado.', 404)
    }

    await this.campaignTypeRepository.remove(campaignType.id, dbTransaction)
  }
}
