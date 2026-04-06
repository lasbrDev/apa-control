import type { AdoptionRepository } from '@/repositories/adoption.repository'
import type { CancelAdoptionsData } from './cancel-adoptions.dto'

export class CancelAdoptionsUseCase {
  constructor(private adoptionRepository: AdoptionRepository) {}

  async execute(data: CancelAdoptionsData): Promise<void> {
    await this.adoptionRepository.cancelByIds(data.ids)
  }
}
