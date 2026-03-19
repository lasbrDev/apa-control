import { makeUpdateCampaignUseCase } from '@/use-cases/campaign/update-campaign/update-campaign.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateCampaignSchema } from './update-campaign.schema'

export async function updateCampaignController(request: FastifyRequest, reply: FastifyReply) {
  const data = updateCampaignSchema.parse(request.body)

  const updateCampaignUseCase = makeUpdateCampaignUseCase()
  await updateCampaignUseCase.execute(data)

  return reply.status(204).send()
}
