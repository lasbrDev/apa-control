import Decimal from 'decimal.js'

import { CampaignStatus } from '@/database/schema/enums/campaign-status'
import { Campaign } from '@/entities'
import type { CampaignTypeRepository } from '@/repositories/campaign-type.repository'
import type { CampaignRepository } from '@/repositories/campaign.repository'
import { ApiError } from '@/utils/api-error'
import type { CreateCampaignData } from './create-campaign.dto'

export class CreateCampaignUseCase {
  constructor(
    private campaignRepository: CampaignRepository,
    private campaignTypeRepository: CampaignTypeRepository,
  ) {}

  async execute(data: CreateCampaignData): Promise<number> {
    const campaignType = await this.campaignTypeRepository.findById(data.campaignTypeId)
    if (!campaignType) throw new ApiError('Tipo de campanha não encontrado.', 404)
    if (!campaignType.active) throw new ApiError('Tipo de campanha inativo.', 409)
    if (new Date(data.startDate) > new Date(data.endDate)) {
      throw new ApiError('A data inicial deve ser menor ou igual à data final.', 400)
    }

    const [result] = await this.campaignRepository.create(
      new Campaign({
        campaignTypeId: data.campaignTypeId,
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        fundraisingGoal: data.fundraisingGoal != null ? new Decimal(data.fundraisingGoal) : null,
        status: CampaignStatus.ACTIVE,
        observations: data.observations ?? null,
        createdAt: new Date(),
        updatedAt: null,
      }),
      null,
    )

    return result!.id
  }
}
