import { makeListFinalDestinationTypesUseCase } from '@/use-cases/final-destination-type/list-final-destination-types/list-final-destination-types.factory'

export async function listFinalDestinationTypesController() {
  const listFinalDestinationTypesUseCase = makeListFinalDestinationTypesUseCase()
  const result = await listFinalDestinationTypesUseCase.execute()
  return result
}
