import { AdoptionRepository } from '@/repositories/adoption.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { CancelAdoptionUseCase } from './cancel-adoption'

export function makeCancelAdoptionUseCase() {
  return new CancelAdoptionUseCase(new AdoptionRepository(), new AnimalRepository())
}
