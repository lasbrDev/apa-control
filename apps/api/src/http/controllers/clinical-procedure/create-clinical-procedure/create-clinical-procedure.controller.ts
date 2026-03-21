import { makeCreateClinicalProcedureUseCase } from '@/use-cases/clinical-procedure/create-clinical-procedure/create-clinical-procedure.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createClinicalProcedureSchema } from './create-clinical-procedure.schema'

export async function createClinicalProcedureController(request: FastifyRequest, reply: FastifyReply) {
  const body = createClinicalProcedureSchema.parse(request.body)
  const employeeId = request.user.id

  const useCase = makeCreateClinicalProcedureUseCase()
  const id = await useCase.execute(body, employeeId)

  return reply.status(201).send({ id })
}
