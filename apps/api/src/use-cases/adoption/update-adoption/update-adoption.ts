import { db } from '@/database/client'
import { AdoptionStatus } from '@/database/schema/enums/adoption-status'
import { AnimalStatus } from '@/database/schema/enums/animal-status'
import type { AdopterRepository } from '@/repositories/adopter.repository'
import type { AdoptionRepository } from '@/repositories/adoption.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import { ApiError } from '@/utils/api-error'
import type { UpdateAdoptionData } from './update-adoption.dto'

export class UpdateAdoptionUseCase {
  constructor(
    private adoptionRepository: AdoptionRepository,
    private animalRepository: AnimalRepository,
    private adopterRepository: AdopterRepository,
  ) {}

  async execute(data: UpdateAdoptionData): Promise<void> {
    const existing = await this.adoptionRepository.findById(data.id)
    if (!existing) throw new ApiError('Adoção não encontrada.', 404)

    const adopter = await this.adopterRepository.findById(data.adopterId)
    if (!adopter) throw new ApiError('Adotante não encontrado.', 404)

    const wasCompleted = existing.status === AdoptionStatus.COMPLETED
    const willComplete = data.status === AdoptionStatus.COMPLETED

    await db.transaction(async (tx) => {
      await this.adoptionRepository.update(
        data.id,
        {
          adopterId: data.adopterId,
          adoptionDate: data.adoptionDate,
          termSigned: data.termSigned,
          adaptationPeriod: data.adaptationPeriod ?? null,
          status: data.status,
          observations: data.observations ?? null,
        },
        tx,
      )

      if (willComplete && !wasCompleted) {
        await this.animalRepository.update(existing.animalId, { status: AnimalStatus.ADOPTED }, tx)
      } else if (!willComplete && wasCompleted) {
        await this.animalRepository.update(existing.animalId, { status: AnimalStatus.AVAILABLE }, tx)
      }
    })
  }
}
