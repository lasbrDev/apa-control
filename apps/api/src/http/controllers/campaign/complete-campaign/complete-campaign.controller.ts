import { makeCompleteCampaignUseCase } from '@/use-cases/campaign/complete-campaign/complete-campaign.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { completeCampaignSchema } from './complete-campaign.schema'

export async function completeCampaignController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = completeCampaignSchema.parse(request.params)

  const completeCampaignUseCase = makeCompleteCampaignUseCase()
  await completeCampaignUseCase.execute({ id })

  return reply.status(204).send()
}
