import type { OccurrenceTypeRepository } from '@/repositories/occurrence-type.repository'

export class ListOccurrenceTypesUseCase {
  constructor(private occurrenceTypeRepository: OccurrenceTypeRepository) {}

  async execute() {
    return this.occurrenceTypeRepository.list()
  }
}
