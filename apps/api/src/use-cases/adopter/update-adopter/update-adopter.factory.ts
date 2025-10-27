import { AdopterRepository } from '@/repositories/adopter.repository'
import { UpdateAdopterUseCase } from '@/use-cases/adopter/update-adopter/update-adopter'

export function makeUpdateAdopterUseCase() {
  const adopterRepository = new AdopterRepository()
  const updateAdopterUseCase = new UpdateAdopterUseCase(adopterRepository)

  return updateAdopterUseCase
}
