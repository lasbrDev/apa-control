import { makeCreateTransactionTypeUseCase } from '@/use-cases/transaction-type/create-transaction-type/create-transaction-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createTransactionTypeSchema } from './create-transaction-type.schema'

export async function createTransactionTypeController(request: FastifyRequest, reply: FastifyReply) {
  const data = createTransactionTypeSchema.parse(request.body)
  const createTransactionTypeUseCase = makeCreateTransactionTypeUseCase()

  const { id } = await createTransactionTypeUseCase.execute(data)
  return reply.status(201).send({ id })
}
