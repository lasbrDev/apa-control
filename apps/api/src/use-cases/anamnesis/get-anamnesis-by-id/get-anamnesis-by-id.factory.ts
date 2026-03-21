import { AnamnesisRepository } from '@/repositories/anamnesis.repository'
import { GetAnamnesisByIdUseCase } from './get-anamnesis-by-id'

export function makeGetAnamnesisByIdUseCase() {
  return new GetAnamnesisByIdUseCase(new AnamnesisRepository())
}
