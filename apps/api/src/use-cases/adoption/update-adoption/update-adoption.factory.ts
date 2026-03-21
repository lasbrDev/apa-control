import { AdopterRepository } from '@/repositories/adopter.repository'
import { AdoptionRepository } from '@/repositories/adoption.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { UpdateAdoptionUseCase } from './update-adoption'

export function makeUpdateAdoptionUseCase() {
  return new UpdateAdoptionUseCase(new AdoptionRepository(), new AnimalRepository(), new AdopterRepository())
}
