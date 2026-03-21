import { makeRemoveRevenueUseCase } from '@/use-cases/revenue/remove-revenue/remove-revenue.factory'
import type { FastifyRequest } from 'fastify'
import { removeRevenueSchema } from './remove-revenue.schema'

export async function removeRevenueController(request: FastifyRequest) {
  const { id } = removeRevenueSchema.parse(request.params)

  const removeRevenueUseCase = makeRemoveRevenueUseCase()
  await removeRevenueUseCase.execute({ id })

  return { message: 'Receita removida com sucesso' }
}
