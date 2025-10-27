import { makeGetTransactionTypeByIdUseCase } from '@/use-cases/transaction-type/get-transaction-type-by-id/get-transaction-type-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getTransactionTypeByIdSchema } from './get-transaction-type-by-id.schema'

export async function getTransactionTypeByIdController(request: FastifyRequest) {
  const { id } = getTransactionTypeByIdSchema.parse(request.params)

  const getTransactionTypeByIdUseCase = makeGetTransactionTypeByIdUseCase()
  const result = await getTransactionTypeByIdUseCase.execute({ id })

  return result
}
