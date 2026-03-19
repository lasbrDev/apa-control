import { makeCreateCampaignUseCase } from '@/use-cases/campaign/create-campaign/create-campaign.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createCampaignSchema } from './create-campaign.schema'

export async function createCampaignController(request: FastifyRequest, reply: FastifyReply) {
  const body = createCampaignSchema.parse(request.body)

  const createCampaignUseCase = makeCreateCampaignUseCase()
  const id = await createCampaignUseCase.execute({
    campaignTypeId: body.campaignTypeId,
    title: body.title,
    description: body.description,
    startDate: body.startDate,
    endDate: body.endDate,
    fundraisingGoal: body.fundraisingGoal,
    status: body.status,
    observations: body.observations ?? null,
  })

  return reply.status(201).send({ id })
}
