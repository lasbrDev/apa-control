import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { OccurrenceTypeRepository } from '@/repositories/occurrence-type.repository'
import { OccurrenceRepository } from '@/repositories/occurrence.repository'
import { RemoveOccurrenceUseCase } from './remove-occurrence'

export function makeRemoveOccurrenceUseCase() {
  return new RemoveOccurrenceUseCase(
    new OccurrenceRepository(),
    new OccurrenceTypeRepository(),
    new AnimalHistoryRepository(),
  )
}
