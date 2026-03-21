import { OccurrenceRepository } from '@/repositories/occurrence.repository'
import { GetOccurrenceByIdUseCase } from './get-occurrence-by-id'

export function makeGetOccurrenceByIdUseCase() {
  return new GetOccurrenceByIdUseCase(new OccurrenceRepository())
}
