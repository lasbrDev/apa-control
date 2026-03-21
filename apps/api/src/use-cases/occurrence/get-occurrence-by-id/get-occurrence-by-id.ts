import type { OccurrenceRepository } from '@/repositories/occurrence.repository'
import { ApiError } from '@/utils/api-error'

export class GetOccurrenceByIdUseCase {
  constructor(private occurrenceRepository: OccurrenceRepository) {}

  async execute(id: number) {
    const item = await this.occurrenceRepository.findById(id)
    if (!item) throw new ApiError('Ocorrência não encontrada.', 404)
    return item
  }
}
