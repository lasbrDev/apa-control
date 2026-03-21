import type { AnamnesisRepository } from '@/repositories/anamnesis.repository'
import type { AnamnesisWithDetails, ListAnamnesesData } from './list-anamneses.dto'

export class ListAnamnesesUseCase {
  constructor(private anamnesisRepository: AnamnesisRepository) {}

  async execute(data: ListAnamnesesData): Promise<[number, AnamnesisWithDetails[]]> {
    return await this.anamnesisRepository.list(data)
  }
}
