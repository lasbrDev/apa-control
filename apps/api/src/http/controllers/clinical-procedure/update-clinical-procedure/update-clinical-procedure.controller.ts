import { makeUpdateClinicalProcedureUseCase } from '@/use-cases/clinical-procedure/update-clinical-procedure/update-clinical-procedure.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateClinicalProcedureSchema } from './update-clinical-procedure.schema'

export async function updateClinicalProcedureController(request: FastifyRequest, reply: FastifyReply) {
  const body = updateClinicalProcedureSchema.parse(request.body)
  const employeeId = request.user.id

  const useCase = makeUpdateClinicalProcedureUseCase()
  await useCase.execute(body, employeeId)

  return reply.status(204).send()
}
