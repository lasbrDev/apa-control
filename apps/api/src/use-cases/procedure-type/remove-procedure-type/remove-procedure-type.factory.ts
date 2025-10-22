import { ProcedureTypeRepository } from '@/repositories/procedure-type.repository'
import { RemoveProcedureTypeUseCase } from '@/use-cases/procedure-type/remove-procedure-type/remove-procedure-type'

export function makeRemoveProcedureTypeUseCase() {
  const procedureTypeRepository = new ProcedureTypeRepository()
  const removeProcedureTypeUseCase = new RemoveProcedureTypeUseCase(procedureTypeRepository)

  return removeProcedureTypeUseCase
}
