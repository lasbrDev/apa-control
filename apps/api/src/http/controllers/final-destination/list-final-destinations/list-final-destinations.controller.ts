import { makeListFinalDestinationsUseCase } from '@/use-cases/final-destination/list-final-destinations/list-final-destinations.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listFinalDestinationsSchema } from './list-final-destinations.schema'

export async function listFinalDestinationsController(request: FastifyRequest, reply: FastifyReply) {
  const data = listFinalDestinationsSchema.parse(request.query)
  const listFinalDestinationsUseCase = makeListFinalDestinationsUseCase()
  const [count, items] = await listFinalDestinationsUseCase.execute(data)

  if (data.exportType) {
    const exportItems = items.map(({ proof: _proof, ...rest }) => rest)
    return exportListData(reply, data.exportType, 'Destinos Finais', 'destinos-finais', exportItems)
  }

  reply.header('X-Total-Count', count)
  return items
}
