import { makeCreateCampaignTypeUseCase } from '@/use-cases/campaign-type/create-campaign-type/create-campaign-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createCampaignTypeSchema } from './create-campaign-type.schema'

export async function createCampaignTypeController(request: FastifyRequest, reply: FastifyReply) {
  const data = createCampaignTypeSchema.parse(request.body)
  const createCampaignTypeUseCase = makeCreateCampaignTypeUseCase()

  const { id } = await createCampaignTypeUseCase.execute(data)
  return reply.status(201).send({ id })
}
