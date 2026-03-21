import { makeListOccurrenceTypesUseCase } from '@/use-cases/occurrence-type/list-occurrence-types/list-occurrence-types.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

const querySchema = z.object({
  exportType: z.enum(['csv', 'xlsx', 'pdf']).optional(),
})

export async function listOccurrenceTypesController(request: FastifyRequest, reply: FastifyReply) {
  const data = querySchema.parse(request.query)
  const useCase = makeListOccurrenceTypesUseCase()
  const result = await useCase.execute()

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Tipos de Ocorrência', 'tipos-ocorrencia', result)
  }

  return result
}
