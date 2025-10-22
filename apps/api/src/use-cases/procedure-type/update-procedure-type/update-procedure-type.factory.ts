import { ProcedureTypeRepository } from '@/repositories/procedure-type.repository'
import { UpdateProcedureTypeUseCase } from '@/use-cases/procedure-type/update-procedure-type/update-procedure-type'

export function makeUpdateProcedureTypeUseCase() {
  const procedureTypeRepository = new ProcedureTypeRepository()
  const updateProcedureTypeUseCase = new UpdateProcedureTypeUseCase(procedureTypeRepository)

  return updateProcedureTypeUseCase
}
