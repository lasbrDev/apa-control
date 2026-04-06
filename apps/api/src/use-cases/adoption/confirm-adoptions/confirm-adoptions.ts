import { AnimalStatus } from '@/database/schema/enums/animal-status'
import type { AdoptionRepository } from '@/repositories/adoption.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { ConfirmAdoptionsData } from './confirm-adoptions.dto'

export class ConfirmAdoptionsUseCase {
  constructor(
    private adoptionRepository: AdoptionRepository,
    private animalRepository: AnimalRepository,
  ) {}

  async execute(data: ConfirmAdoptionsData): Promise<void> {
    const adoptions = await this.adoptionRepository.findByIds(data.ids)
    await this.adoptionRepository.confirmByIds(data.ids)

    for (const adoption of adoptions) {
      await this.animalRepository.update(adoption.animalId, { status: AnimalStatus.INACTIVE }, null)
    }
  }
}
