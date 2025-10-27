import { AdopterRepository } from '@/repositories/adopter.repository'
import { CreateAdopterUseCase } from '@/use-cases/adopter/create-adopter/create-adopter'

export function makeCreateAdopterUseCase() {
  const adopterRepository = new AdopterRepository()
  const createAdopterUseCase = new CreateAdopterUseCase(adopterRepository)

  return createAdopterUseCase
}
