import { AdoptionRepository } from '@/repositories/adoption.repository'
import { ListAdoptionsUseCase } from './list-adoptions'

export function makeListAdoptionsUseCase() {
  return new ListAdoptionsUseCase(new AdoptionRepository())
}
