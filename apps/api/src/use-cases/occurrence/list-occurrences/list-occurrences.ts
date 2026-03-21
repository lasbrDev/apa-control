import type { ListOccurrencesData, OccurrenceRepository } from '@/repositories/occurrence.repository'

export class ListOccurrencesUseCase {
  constructor(private occurrenceRepository: OccurrenceRepository) {}

  async execute(data: ListOccurrencesData) {
    return this.occurrenceRepository.list(data)
  }
}
