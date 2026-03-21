import type { AnamnesisRepository } from '@/repositories/anamnesis.repository'
import type { AnamnesisWithDetails } from '../list-anamneses/list-anamneses.dto'
import type { GetAnamnesisByIdData } from './get-anamnesis-by-id.dto'

export class GetAnamnesisByIdUseCase {
  constructor(private anamnesisRepository: AnamnesisRepository) {}

  async execute(data: GetAnamnesisByIdData): Promise<AnamnesisWithDetails> {
    return await this.anamnesisRepository.findByIdOrThrow(data.id)
  }
}
