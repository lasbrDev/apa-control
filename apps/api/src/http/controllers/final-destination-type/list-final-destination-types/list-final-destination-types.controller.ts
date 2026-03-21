import { makeListFinalDestinationTypesUseCase } from '@/use-cases/final-destination-type/list-final-destination-types/list-final-destination-types.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

const querySchema = z.object({
  exportType: z.enum(['csv', 'xlsx', 'pdf']).optional(),
})

export async function listFinalDestinationTypesController(request: FastifyRequest, reply: FastifyReply) {
  const data = querySchema.parse(request.query)
  const listFinalDestinationTypesUseCase = makeListFinalDestinationTypesUseCase()
  const result = await listFinalDestinationTypesUseCase.execute()

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Tipos de Destino Final', 'tipos-destino-final', result)
  }

  return result
}
