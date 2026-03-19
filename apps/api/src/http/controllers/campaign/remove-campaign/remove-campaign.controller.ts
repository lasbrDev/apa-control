import { makeRemoveCampaignUseCase } from '@/use-cases/campaign/remove-campaign/remove-campaign.factory'
import type { FastifyRequest } from 'fastify'
import { removeCampaignSchema } from './remove-campaign.schema'

export async function removeCampaignController(request: FastifyRequest) {
  const { id } = removeCampaignSchema.parse(request.params)

  const removeCampaignUseCase = makeRemoveCampaignUseCase()
  await removeCampaignUseCase.execute({ id })

  return { message: 'Campanha removida com sucesso' }
}
