import { OccurrenceRepository } from '@/repositories/occurrence.repository'
import { ListOccurrencesUseCase } from './list-occurrences'

export function makeListOccurrencesUseCase() {
  return new ListOccurrencesUseCase(new OccurrenceRepository())
}
