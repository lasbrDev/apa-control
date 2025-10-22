import { makeUpdateProcedureTypeUseCase } from '@/use-cases/procedure-type/update-procedure-type/update-procedure-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateProcedureTypeSchema } from './update-procedure-type.schema'

export async function updateProcedureTypeController(request: FastifyRequest, reply: FastifyReply) {
  const data = updateProcedureTypeSchema.parse(request.body)

  const updateProcedureTypeUseCase = makeUpdateProcedureTypeUseCase()
  await updateProcedureTypeUseCase.execute(data)

  return reply.status(204).send()
}
