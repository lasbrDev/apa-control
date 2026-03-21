import { OccurrenceTypeRepository } from '@/repositories/occurrence-type.repository'
import { ListOccurrenceTypesUseCase } from './list-occurrence-types'

export function makeListOccurrenceTypesUseCase() {
  return new ListOccurrenceTypesUseCase(new OccurrenceTypeRepository())
}
