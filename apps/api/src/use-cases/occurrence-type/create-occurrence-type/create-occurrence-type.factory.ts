import { OccurrenceTypeRepository } from '@/repositories/occurrence-type.repository'
import { CreateOccurrenceTypeUseCase } from './create-occurrence-type'

export function makeCreateOccurrenceTypeUseCase() {
  return new CreateOccurrenceTypeUseCase(new OccurrenceTypeRepository())
}
