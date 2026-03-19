import { makeGetAnimalHistoryByIdUseCase } from '@/use-cases/animal-history/get-animal-history-by-id/get-animal-history-by-id.factory'
import type { FastifyRequest } from 'fastify'

import { getAnimalHistoryByIdQuerySchema, getAnimalHistoryByIdSchema } from './get-animal-history-by-id.schema'

export async function getAnimalHistoryByIdController(request: FastifyRequest) {
  const { id } = getAnimalHistoryByIdSchema.parse(request.params)
  const { type, types, startDate, endDate, employeeId } = getAnimalHistoryByIdQuerySchema.parse(request.query)

  const getAnimalHistoryByIdUseCase = makeGetAnimalHistoryByIdUseCase()
  const result = await getAnimalHistoryByIdUseCase.execute({
    id,
    types: types ?? (type ? [type] : undefined),
    startDate,
    endDate,
    employeeId,
  })

  return result
}
