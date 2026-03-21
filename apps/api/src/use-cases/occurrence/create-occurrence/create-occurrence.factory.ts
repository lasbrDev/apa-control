import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { OccurrenceTypeRepository } from '@/repositories/occurrence-type.repository'
import { OccurrenceRepository } from '@/repositories/occurrence.repository'
import { CreateOccurrenceUseCase } from './create-occurrence'

export function makeCreateOccurrenceUseCase() {
  return new CreateOccurrenceUseCase(
    new OccurrenceRepository(),
    new OccurrenceTypeRepository(),
    new AnimalRepository(),
    new AnimalHistoryRepository(),
  )
}
