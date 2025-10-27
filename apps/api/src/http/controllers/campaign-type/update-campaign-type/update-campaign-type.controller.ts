import { makeUpdateCampaignTypeUseCase } from '@/use-cases/campaign-type/update-campaign-type/update-campaign-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateCampaignTypeSchema } from './update-campaign-type.schema'

export async function updateCampaignTypeController(request: FastifyRequest, reply: FastifyReply) {
  const data = updateCampaignTypeSchema.parse(request.body)

  const updateCampaignTypeUseCase = makeUpdateCampaignTypeUseCase()
  await updateCampaignTypeUseCase.execute(data)

  return reply.status(204).send()
}
