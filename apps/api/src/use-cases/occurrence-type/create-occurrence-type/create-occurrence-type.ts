import { OccurrenceType } from '@/entities'
import type { OccurrenceTypeRepository } from '@/repositories/occurrence-type.repository'
import { ApiError } from '@/utils/api-error'

type CreateOccurrenceTypeData = {
  name: string
  description?: string | null
  active?: boolean
}

export class CreateOccurrenceTypeUseCase {
  constructor(private occurrenceTypeRepository: OccurrenceTypeRepository) {}

  async execute(data: CreateOccurrenceTypeData): Promise<number> {
    const name = data.name.trim()
    if (!name) throw new ApiError('Nome é obrigatório.', 400)

    const hasName = await this.occurrenceTypeRepository.hasName(name)
    if (hasName) throw new ApiError('Já existe tipo de ocorrência com este nome.', 409)

    const result = await this.occurrenceTypeRepository.create(
      new OccurrenceType({
        name,
        description: data.description?.trim() || null,
        active: data.active ?? true,
        createdAt: new Date(),
      }),
    )

    return result!.id
  }
}
