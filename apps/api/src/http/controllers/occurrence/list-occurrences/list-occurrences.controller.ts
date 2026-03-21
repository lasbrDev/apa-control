import { makeListOccurrencesUseCase } from '@/use-cases/occurrence/list-occurrences/list-occurrences.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listOccurrencesSchema } from './list-occurrences.schema'

export async function listOccurrencesController(request: FastifyRequest, reply: FastifyReply) {
  const data = listOccurrencesSchema.parse(request.query)
  const useCase = makeListOccurrencesUseCase()
  const [count, items] = await useCase.execute(data)

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Ocorrências', 'ocorrencias', items)
  }

  reply.header('X-Total-Count', count)
  return items
}
