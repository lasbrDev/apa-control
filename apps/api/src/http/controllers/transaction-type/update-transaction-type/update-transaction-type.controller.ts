import { makeUpdateTransactionTypeUseCase } from '@/use-cases/transaction-type/update-transaction-type/update-transaction-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateTransactionTypeSchema } from './update-transaction-type.schema'

export async function updateTransactionTypeController(request: FastifyRequest, reply: FastifyReply) {
  const data = updateTransactionTypeSchema.parse(request.body)

  const updateTransactionTypeUseCase = makeUpdateTransactionTypeUseCase()
  await updateTransactionTypeUseCase.execute(data)

  return reply.status(204).send()
}
