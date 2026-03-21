import { makeListCampaignsUseCase } from '@/use-cases/campaign/list-campaigns/list-campaigns.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listCampaignsSchema } from './list-campaigns.schema'

export async function listCampaignsController(request: FastifyRequest, reply: FastifyReply) {
  const data = listCampaignsSchema.parse(request.query)
  const listCampaignsUseCase = makeListCampaignsUseCase()
  const [count, items] = await listCampaignsUseCase.execute(data)

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Campanhas', 'campanhas', items)
  }

  reply.header('X-Total-Count', count)
  return items
}
