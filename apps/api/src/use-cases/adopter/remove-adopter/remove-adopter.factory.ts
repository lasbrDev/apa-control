import { AdopterRepository } from '@/repositories/adopter.repository'
import { RemoveAdopterUseCase } from '@/use-cases/adopter/remove-adopter/remove-adopter'

export function makeRemoveAdopterUseCase() {
  const adopterRepository = new AdopterRepository()
  const removeAdopterUseCase = new RemoveAdopterUseCase(adopterRepository)

  return removeAdopterUseCase
}
