import { db } from '@/database/client'
import { makeRemoveProcedureTypeUseCase } from '@/use-cases/procedure-type/remove-procedure-type/remove-procedure-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { removeProcedureTypeSchema } from './remove-procedure-type.schema'

export async function removeProcedureTypeController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = removeProcedureTypeSchema.parse(request.params)

  const removeProcedureTypeUseCase = makeRemoveProcedureTypeUseCase()
  await db.transaction((dbTransaction) => removeProcedureTypeUseCase.execute({ id }, dbTransaction))

  return reply.status(204).send()
}
