import { makeListProcedureTypesUseCase } from '@/use-cases/procedure-type/list-procedure-types/list-procedure-types.factory'

export async function listProcedureTypesController() {
  const listProcedureTypesUseCase = makeListProcedureTypesUseCase()
  const result = await listProcedureTypesUseCase.execute()
  return result
}
