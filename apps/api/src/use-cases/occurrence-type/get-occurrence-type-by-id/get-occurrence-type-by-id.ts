import type { OccurrenceTypeRepository } from '@/repositories/occurrence-type.repository'
import { ApiError } from '@/utils/api-error'

export class GetOccurrenceTypeByIdUseCase {
  constructor(private occurrenceTypeRepository: OccurrenceTypeRepository) {}

  async execute(id: number) {
    const item = await this.occurrenceTypeRepository.findById(id)
    if (!item) throw new ApiError('Tipo de ocorrência não encontrado.', 404)
    return item
  }
}
