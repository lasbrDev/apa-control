import type { AdoptionRepository } from '@/repositories/adoption.repository'
import type { AdoptionWithDetails } from '@/use-cases/adoption/list-adoptions/list-adoptions.dto'
import type { GetAdoptionByIdData } from './get-adoption-by-id.dto'

export class GetAdoptionByIdUseCase {
  constructor(private adoptionRepository: AdoptionRepository) {}

  async execute(data: GetAdoptionByIdData): Promise<AdoptionWithDetails> {
    return await this.adoptionRepository.findByIdOrThrow(data.id)
  }
}
