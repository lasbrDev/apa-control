import { OccurrenceTypeRepository } from '@/repositories/occurrence-type.repository'
import { RemoveOccurrenceTypeUseCase } from './remove-occurrence-type'

export function makeRemoveOccurrenceTypeUseCase() {
  return new RemoveOccurrenceTypeUseCase(new OccurrenceTypeRepository())
}
