import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { OccurrenceTypeRepository } from '@/repositories/occurrence-type.repository'
import { OccurrenceRepository } from '@/repositories/occurrence.repository'
import { UpdateOccurrenceUseCase } from './update-occurrence'

export function makeUpdateOccurrenceUseCase() {
  return new UpdateOccurrenceUseCase(
    new OccurrenceRepository(),
    new OccurrenceTypeRepository(),
    new AnimalRepository(),
    new AnimalHistoryRepository(),
  )
}
