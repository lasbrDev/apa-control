import { makeListCampaignTypesUseCase } from '@/use-cases/campaign-type/list-campaign-types/list-campaign-types.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

const querySchema = z.object({
  exportType: z.enum(['csv', 'xlsx', 'pdf']).optional(),
})

export async function listCampaignTypesController(request: FastifyRequest, reply: FastifyReply) {
  const data = querySchema.parse(request.query)
  const listCampaignTypesUseCase = makeListCampaignTypesUseCase()
  const result = await listCampaignTypesUseCase.execute()

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Tipos de Campanha', 'tipos-campanha', result)
  }

  return result
}
