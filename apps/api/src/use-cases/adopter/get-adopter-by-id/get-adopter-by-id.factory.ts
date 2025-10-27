import { AdopterRepository } from '@/repositories/adopter.repository'
import { GetAdopterByIdUseCase } from '@/use-cases/adopter/get-adopter-by-id/get-adopter-by-id'

export function makeGetAdopterByIdUseCase() {
  const adopterRepository = new AdopterRepository()
  const getAdopterByIdUseCase = new GetAdopterByIdUseCase(adopterRepository)

  return getAdopterByIdUseCase
}
