import { makeGetCampaignTypeByIdUseCase } from '@/use-cases/campaign-type/get-campaign-type-by-id/get-campaign-type-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getCampaignTypeByIdSchema } from './get-campaign-type-by-id.schema'

export async function getCampaignTypeByIdController(request: FastifyRequest) {
  const { id } = getCampaignTypeByIdSchema.parse(request.params)

  const getCampaignTypeByIdUseCase = makeGetCampaignTypeByIdUseCase()
  const result = await getCampaignTypeByIdUseCase.execute({ id })

  return result
}
