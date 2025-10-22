import { makeGetProcedureTypeByIdUseCase } from '@/use-cases/procedure-type/get-procedure-type-by-id/get-procedure-type-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getProcedureTypeByIdSchema } from './get-procedure-type-by-id.schema'

export async function getProcedureTypeByIdController(request: FastifyRequest) {
  const { id } = getProcedureTypeByIdSchema.parse(request.params)

  const getProcedureTypeByIdUseCase = makeGetProcedureTypeByIdUseCase()
  const result = await getProcedureTypeByIdUseCase.execute({ id })

  return result
}
