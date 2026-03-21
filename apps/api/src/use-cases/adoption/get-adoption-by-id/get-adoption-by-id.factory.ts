import { AdoptionRepository } from '@/repositories/adoption.repository'
import { GetAdoptionByIdUseCase } from './get-adoption-by-id'

export function makeGetAdoptionByIdUseCase() {
  return new GetAdoptionByIdUseCase(new AdoptionRepository())
}
