import type { AdoptionRepository } from '@/repositories/adoption.repository'
import type { AdoptionWithDetails, ListAdoptionsData } from './list-adoptions.dto'

export class ListAdoptionsUseCase {
  constructor(private adoptionRepository: AdoptionRepository) {}

  async execute(data: ListAdoptionsData): Promise<[number, AdoptionWithDetails[]]> {
    return await this.adoptionRepository.list(data)
  }
}
