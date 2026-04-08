import Decimal from 'decimal.js'

import type { CampaignTypeRepository } from '@/repositories/campaign-type.repository'
import type { CampaignRepository } from '@/repositories/campaign.repository'
import { ApiError } from '@/utils/api-error'
import { removeUploadFile } from '@/utils/files/remove-upload-file'
import type { UpdateCampaignData } from './update-campaign.dto'

export class UpdateCampaignUseCase {
  constructor(
    private campaignRepository: CampaignRepository,
    private campaignTypeRepository: CampaignTypeRepository,
  ) {}

  async execute(data: UpdateCampaignData): Promise<void> {
    const [campaign, campaignType] = await Promise.all([
      this.campaignRepository.findById(data.id),
      this.campaignTypeRepository.findById(data.campaignTypeId),
    ])

    if (!campaign) throw new ApiError('Campanha não encontrada.', 404)
    if (!campaignType) throw new ApiError('Tipo de campanha não encontrado.', 404)
    if (!campaignType.active) throw new ApiError('Tipo de campanha inativo.', 409)
    if (new Date(data.startDate) > new Date(data.endDate)) {
      throw new ApiError('A data inicial deve ser menor ou igual à data final.', 400)
    }
    const proof = data.proof ?? null

    await this.campaignRepository.update(data.id, {
      campaignTypeId: data.campaignTypeId,
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      fundraisingGoal: data.fundraisingGoal != null ? new Decimal(data.fundraisingGoal) : null,
      proof,
      observations: data.observations ?? null,
      updatedAt: new Date(),
    })

    if (campaign.proof && campaign.proof !== proof) {
      await removeUploadFile(campaign.proof)
    }
  }
}
