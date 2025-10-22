import { ProcedureTypeRepository } from '@/repositories/procedure-type.repository'
import { ListProcedureTypesUseCase } from '@/use-cases/procedure-type/list-procedure-types/list-procedure-types'

export function makeListProcedureTypesUseCase() {
  const procedureTypeRepository = new ProcedureTypeRepository()
  const listProcedureTypesUseCase = new ListProcedureTypesUseCase(procedureTypeRepository)

  return listProcedureTypesUseCase
}
