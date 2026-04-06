import { makeCancelCampaignUseCase } from '@/use-cases/campaign/cancel-campaign/cancel-campaign.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { cancelCampaignSchema } from './cancel-campaign.schema'

export async function cancelCampaignController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = cancelCampaignSchema.parse(request.params)

  const cancelCampaignUseCase = makeCancelCampaignUseCase()
  await cancelCampaignUseCase.execute({ id })

  return reply.status(204).send()
}
