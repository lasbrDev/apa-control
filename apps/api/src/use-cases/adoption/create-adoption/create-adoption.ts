import { db } from '@/database/client'
import { AdoptionStatus } from '@/database/schema/enums/adoption-status'
import { AnimalStatus } from '@/database/schema/enums/animal-status'
import { Adoption } from '@/entities'
import type { AdopterRepository } from '@/repositories/adopter.repository'
import type { AdoptionRepository } from '@/repositories/adoption.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import { ApiError } from '@/utils/api-error'
import type { CreateAdoptionData } from './create-adoption.dto'

export class CreateAdoptionUseCase {
  constructor(
    private adoptionRepository: AdoptionRepository,
    private animalRepository: AnimalRepository,
    private adopterRepository: AdopterRepository,
  ) {}

  async execute(data: CreateAdoptionData, employeeId: number): Promise<number> {
    const existingAdoption = await this.adoptionRepository.findByAnimalId(data.animalId)
    if (existingAdoption) {
      throw new ApiError('Este animal já possui adoção registrada.', 409)
    }

    const animal = await this.animalRepository.findById(data.animalId)
    if (!animal) throw new ApiError('Animal não encontrado.', 404)
    if (animal.status === AnimalStatus.INACTIVE) {
      throw new ApiError('O animal já consta como inativo.', 409)
    }

    const adopter = await this.adopterRepository.findById(data.adopterId)
    if (!adopter) throw new ApiError('Adotante não encontrado.', 404)

    return await db.transaction(async (tx) => {
      const [row] = await this.adoptionRepository.create(
        new Adoption({
          animalId: data.animalId,
          adopterId: data.adopterId,
          employeeId,
          adoptionDate: data.adoptionDate,
          adaptationPeriod: data.adaptationPeriod ?? null,
          status: data.status,
          observations: data.observations ?? null,
          proof: data.proof ?? null,
          createdAt: new Date(),
          updatedAt: null,
        }),
        tx,
      )

      if (data.status === AdoptionStatus.COMPLETED) {
        await this.animalRepository.update(data.animalId, { status: AnimalStatus.INACTIVE }, tx)
      }

      return row!.id
    })
  }
}
