import { makeGetExpenseByIdUseCase } from '@/use-cases/expense/get-expense-by-id/get-expense-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getExpenseByIdSchema } from './get-expense-by-id.schema'

export async function getExpenseByIdController(request: FastifyRequest) {
  const { id } = getExpenseByIdSchema.parse(request.params)

  const getExpenseByIdUseCase = makeGetExpenseByIdUseCase()
  return await getExpenseByIdUseCase.execute({ id })
}
