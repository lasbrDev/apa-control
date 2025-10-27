import { FinalDestinationTypeRepository } from '@/repositories/final-destination-type.repository'
import { CreateFinalDestinationTypeUseCase } from '@/use-cases/final-destination-type/create-final-destination-type/create-final-destination-type'

export function makeCreateFinalDestinationTypeUseCase() {
  const finalDestinationTypeRepository = new FinalDestinationTypeRepository()
  const createFinalDestinationTypeUseCase = new CreateFinalDestinationTypeUseCase(finalDestinationTypeRepository)

  return createFinalDestinationTypeUseCase
}
