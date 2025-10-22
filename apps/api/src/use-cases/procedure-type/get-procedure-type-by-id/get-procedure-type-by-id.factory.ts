import { ProcedureTypeRepository } from '@/repositories/procedure-type.repository'
import { GetProcedureTypeByIdUseCase } from '@/use-cases/procedure-type/get-procedure-type-by-id/get-procedure-type-by-id'

export function makeGetProcedureTypeByIdUseCase() {
  const procedureTypeRepository = new ProcedureTypeRepository()
  const getProcedureTypeByIdUseCase = new GetProcedureTypeByIdUseCase(procedureTypeRepository)

  return getProcedureTypeByIdUseCase
}
