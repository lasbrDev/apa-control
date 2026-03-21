import { db } from '@/database/client'
import type { OccurrenceTypeRepository } from '@/repositories/occurrence-type.repository'
import { ApiError } from '@/utils/api-error'

export class RemoveOccurrenceTypeUseCase {
  constructor(private occurrenceTypeRepository: OccurrenceTypeRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.occurrenceTypeRepository.findById(id)
    if (!existing) throw new ApiError('Tipo de ocorrência não encontrado.', 404)

    const totalLinked = await this.occurrenceTypeRepository.countByOccurrenceTypeId(id, null)
    if (totalLinked > 0) throw new ApiError('Não é possível remover tipo de ocorrência já utilizado.', 409)

    await db.transaction(async (tx) => {
      await this.occurrenceTypeRepository.remove(id, tx)
    })
  }
}
