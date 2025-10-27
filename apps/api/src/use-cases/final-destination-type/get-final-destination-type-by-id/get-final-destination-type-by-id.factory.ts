import { FinalDestinationTypeRepository } from '@/repositories/final-destination-type.repository'
import { GetFinalDestinationTypeByIdUseCase } from '@/use-cases/final-destination-type/get-final-destination-type-by-id/get-final-destination-type-by-id'

export function makeGetFinalDestinationTypeByIdUseCase() {
  const finalDestinationTypeRepository = new FinalDestinationTypeRepository()
  const getFinalDestinationTypeByIdUseCase = new GetFinalDestinationTypeByIdUseCase(finalDestinationTypeRepository)

  return getFinalDestinationTypeByIdUseCase
}
