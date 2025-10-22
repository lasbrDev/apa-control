import { makeCreateProcedureTypeUseCase } from '@/use-cases/procedure-type/create-procedure-type/create-procedure-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createProcedureTypeSchema } from './create-procedure-type.schema'

export async function createProcedureTypeController(request: FastifyRequest, reply: FastifyReply) {
  const data = createProcedureTypeSchema.parse(request.body)
  const createProcedureTypeUseCase = makeCreateProcedureTypeUseCase()

  const { id } = await createProcedureTypeUseCase.execute(data)
  return reply.status(201).send({ id })
}
