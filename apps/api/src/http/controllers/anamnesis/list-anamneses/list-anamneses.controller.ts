import { makeListAnamnesesUseCase } from '@/use-cases/anamnesis/list-anamneses/list-anamneses.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listAnamnesesSchema } from './list-anamneses.schema'

export async function listAnamnesesController(request: FastifyRequest, reply: FastifyReply) {
  const data = listAnamnesesSchema.parse(request.query)
  const useCase = makeListAnamnesesUseCase()
  const [count, items] = await useCase.execute(data)

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Anamneses', 'anamneses', items)
  }

  reply.header('X-Total-Count', count)
  return items
}
