import { makeGetRevenueByIdUseCase } from '@/use-cases/revenue/get-revenue-by-id/get-revenue-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getRevenueByIdSchema } from './get-revenue-by-id.schema'

export async function getRevenueByIdController(request: FastifyRequest) {
  const { id } = getRevenueByIdSchema.parse(request.params)

  const getRevenueByIdUseCase = makeGetRevenueByIdUseCase()
  return await getRevenueByIdUseCase.execute({ id })
}
