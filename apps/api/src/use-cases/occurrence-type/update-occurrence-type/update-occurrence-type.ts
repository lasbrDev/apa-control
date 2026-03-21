import type { OccurrenceTypeRepository } from '@/repositories/occurrence-type.repository'
import { ApiError } from '@/utils/api-error'

type UpdateOccurrenceTypeData = {
  id: number
  name: string
  description?: string | null
  active: boolean
}

export class UpdateOccurrenceTypeUseCase {
  constructor(private occurrenceTypeRepository: OccurrenceTypeRepository) {}

  async execute(data: UpdateOccurrenceTypeData): Promise<void> {
    const existing = await this.occurrenceTypeRepository.findById(data.id)
    if (!existing) throw new ApiError('Tipo de ocorrência não encontrado.', 404)

    const name = data.name.trim()
    if (!name) throw new ApiError('Nome é obrigatório.', 400)

    if (existing.name !== name) {
      const hasName = await this.occurrenceTypeRepository.hasName(name)
      if (hasName) throw new ApiError('Já existe tipo de ocorrência com este nome.', 409)
    }

    await this.occurrenceTypeRepository.update(data.id, {
      name,
      description: data.description?.trim() || null,
      active: data.active,
    })
  }
}
