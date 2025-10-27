import { db } from '@/database/client'
import { makeRemoveCampaignTypeUseCase } from '@/use-cases/campaign-type/remove-campaign-type/remove-campaign-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { removeCampaignTypeSchema } from './remove-campaign-type.schema'

export async function removeCampaignTypeController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = removeCampaignTypeSchema.parse(request.params)

  const removeCampaignTypeUseCase = makeRemoveCampaignTypeUseCase()
  await db.transaction((dbTransaction) => removeCampaignTypeUseCase.execute({ id }, dbTransaction))

  return reply.status(204).send()
}
