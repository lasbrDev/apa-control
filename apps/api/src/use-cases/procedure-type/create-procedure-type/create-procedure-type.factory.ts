import { ProcedureTypeRepository } from '@/repositories/procedure-type.repository'
import { CreateProcedureTypeUseCase } from '@/use-cases/procedure-type/create-procedure-type/create-procedure-type'

export function makeCreateProcedureTypeUseCase() {
  const procedureTypeRepository = new ProcedureTypeRepository()
  const createProcedureTypeUseCase = new CreateProcedureTypeUseCase(procedureTypeRepository)

  return createProcedureTypeUseCase
}
