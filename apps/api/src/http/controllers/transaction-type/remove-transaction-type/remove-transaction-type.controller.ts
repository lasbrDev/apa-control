import { db } from '@/database/client'
import { makeRemoveTransactionTypeUseCase } from '@/use-cases/transaction-type/remove-transaction-type/remove-transaction-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { removeTransactionTypeSchema } from './remove-transaction-type.schema'

export async function removeTransactionTypeController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = removeTransactionTypeSchema.parse(request.params)

  const removeTransactionTypeUseCase = makeRemoveTransactionTypeUseCase()
  await db.transaction((dbTransaction) => removeTransactionTypeUseCase.execute({ id }, dbTransaction))

  return reply.status(204).send()
}
