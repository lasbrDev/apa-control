import { FinalDestinationTypeRepository } from '@/repositories/final-destination-type.repository'
import { ListFinalDestinationTypesUseCase } from '@/use-cases/final-destination-type/list-final-destination-types/list-final-destination-types'

export function makeListFinalDestinationTypesUseCase() {
  const finalDestinationTypeRepository = new FinalDestinationTypeRepository()
  const listFinalDestinationTypesUseCase = new ListFinalDestinationTypesUseCase(finalDestinationTypeRepository)

  return listFinalDestinationTypesUseCase
}
