import { makeRemoveClinicalProcedureUseCase } from '@/use-cases/clinical-procedure/remove-clinical-procedure/remove-clinical-procedure.factory'
import type { FastifyRequest } from 'fastify'
import { removeClinicalProcedureSchema } from './remove-clinical-procedure.schema'

export async function removeClinicalProcedureController(request: FastifyRequest) {
  const { id } = removeClinicalProcedureSchema.parse(request.params)
  const employeeId = request.user.id

  const useCase = makeRemoveClinicalProcedureUseCase()
  await useCase.execute({ id }, employeeId)

  return { message: 'Procedimento clínico removido com sucesso' }
}
