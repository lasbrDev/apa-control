import { makeGetCampaignByIdUseCase } from '@/use-cases/campaign/get-campaign-by-id/get-campaign-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getCampaignByIdSchema } from './get-campaign-by-id.schema'

export async function getCampaignByIdController(request: FastifyRequest) {
  const { id } = getCampaignByIdSchema.parse(request.params)

  const getCampaignByIdUseCase = makeGetCampaignByIdUseCase()
  const result = await getCampaignByIdUseCase.execute({ id })

  return result
}
