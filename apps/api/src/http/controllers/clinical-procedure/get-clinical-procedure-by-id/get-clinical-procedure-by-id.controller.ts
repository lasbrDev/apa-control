import { makeGetClinicalProcedureByIdUseCase } from '@/use-cases/clinical-procedure/get-clinical-procedure-by-id/get-clinical-procedure-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getClinicalProcedureByIdSchema } from './get-clinical-procedure-by-id.schema'

export async function getClinicalProcedureByIdController(request: FastifyRequest) {
  const { id } = getClinicalProcedureByIdSchema.parse(request.params)
  const useCase = makeGetClinicalProcedureByIdUseCase()
  return await useCase.execute({ id })
}
