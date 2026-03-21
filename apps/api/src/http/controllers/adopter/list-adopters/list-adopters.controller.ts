import { makeListAdoptersUseCase } from '@/use-cases/adopter/list-adopters/list-adopters.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listAdoptersSchema } from './list-adopters.schema'

export async function listAdoptersController(request: FastifyRequest, reply: FastifyReply) {
  const data = listAdoptersSchema.parse(request.query)
  const listAdoptersUseCase = makeListAdoptersUseCase()
  const [count, items] = await listAdoptersUseCase.execute(data)

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Adotantes', 'adotantes', items)
  }

  reply.header('X-Total-Count', count)

  return items
}
