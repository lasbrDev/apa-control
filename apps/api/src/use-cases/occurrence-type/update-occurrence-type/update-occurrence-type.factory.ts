import { OccurrenceTypeRepository } from '@/repositories/occurrence-type.repository'
import { UpdateOccurrenceTypeUseCase } from './update-occurrence-type'

export function makeUpdateOccurrenceTypeUseCase() {
  return new UpdateOccurrenceTypeUseCase(new OccurrenceTypeRepository())
}
