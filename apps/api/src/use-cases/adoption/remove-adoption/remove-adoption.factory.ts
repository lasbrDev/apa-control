import { AdoptionRepository } from '@/repositories/adoption.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { RemoveAdoptionUseCase } from './remove-adoption'

export function makeRemoveAdoptionUseCase() {
  return new RemoveAdoptionUseCase(new AdoptionRepository(), new AnimalRepository())
}
