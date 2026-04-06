import { AdoptionRepository } from '@/repositories/adoption.repository'
import { CancelAdoptionsUseCase } from './cancel-adoptions'

export function makeCancelAdoptionsUseCase() {
  return new CancelAdoptionsUseCase(new AdoptionRepository())
}
