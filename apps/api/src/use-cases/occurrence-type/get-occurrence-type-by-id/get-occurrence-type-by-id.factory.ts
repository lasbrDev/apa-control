import { OccurrenceTypeRepository } from '@/repositories/occurrence-type.repository'
import { GetOccurrenceTypeByIdUseCase } from './get-occurrence-type-by-id'

export function makeGetOccurrenceTypeByIdUseCase() {
  return new GetOccurrenceTypeByIdUseCase(new OccurrenceTypeRepository())
}
