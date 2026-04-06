import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { Animal, AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { CreateAnimalData } from './create-animal.dto'

export class CreateAnimalUseCase {
  constructor(
    private animalRepository: AnimalRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: CreateAnimalData): Promise<number> {
    return await db.transaction(async (tx) => {
      const [animal] = await this.animalRepository.create(
        new Animal({
          ...data,
          status: 'pendente',
          birthYear: data.birthYear ?? null,
          createdAt: new Date(),
        }),
        tx,
      )

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: animal!.id,
          rescueId: null,
          employeeId: data.employeeId,
          type: AnimalHistoryType.REGISTRATION,
          action: 'animal.created',
          description: 'Animal cadastrado',
          oldValue: null,
          newValue: null,
          createdAt: new Date(),
        }),
        tx,
      )

      return animal!.id
    })
  }
}
