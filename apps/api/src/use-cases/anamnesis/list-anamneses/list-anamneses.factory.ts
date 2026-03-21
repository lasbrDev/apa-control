import { AnamnesisRepository } from '@/repositories/anamnesis.repository'
import { ListAnamnesesUseCase } from './list-anamneses'

export function makeListAnamnesesUseCase() {
  return new ListAnamnesesUseCase(new AnamnesisRepository())
}
