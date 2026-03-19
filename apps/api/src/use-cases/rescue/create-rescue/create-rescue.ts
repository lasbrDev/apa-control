import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { Animal, AnimalHistory, Rescue } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { RescueRepository } from '@/repositories/rescue.repository'
import { ApiError } from '@/utils/api-error'
import type { CreateRescueData } from './create-rescue.dto'

export class CreateRescueUseCase {
  constructor(
    private rescueRepository: RescueRepository,
    private animalRepository: AnimalRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: CreateRescueData): Promise<number> {
    return await db.transaction(async (tx) => {
      let animalId: number
      const isNewAnimal = data.animal != null

      if (data.animalId != null) {
        const animal = await this.animalRepository.findById(data.animalId)
        if (!animal) {
          throw new ApiError('Animal não encontrado.', 404)
        }
        animalId = data.animalId
      } else if (data.animal) {
        const [animalRow] = await this.animalRepository.create(
          new Animal({
            ...data.animal!,
            status: 'disponivel',
            createdAt: new Date(),
          }),
          tx,
        )
        animalId = animalRow!.id

        await this.animalHistoryRepository.create(
          new AnimalHistory({
            animalId: animalId!,
            rescueId: null,
            employeeId: data.employeeId,
            type: AnimalHistoryType.REGISTRATION,
            action: 'animal.created',
            description: 'Animal cadastrado',
            oldValue: '',
            newValue: JSON.stringify({
              name: data.animal.name,
              species: data.animal.species,
              breed: data.animal.breed ?? null,
              size: data.animal.size,
              sex: data.animal.sex,
              age: data.animal.age,
              healthCondition: data.animal.healthCondition,
              entryDate: data.animal.entryDate,
              observations: data.animal.observations ?? null,
              status: 'disponivel',
            }),
            createdAt: new Date(),
          }),
          tx,
        )
      } else {
        throw new ApiError('Informe o animal (animalId ou dados do animal) para registrar o resgate.', 400)
      }

      const [rescueRow] = await this.rescueRepository.create(
        new Rescue({
          animalId,
          employeeId: data.employeeId,
          rescueDate: new Date(data.rescueDate),
          locationFound: data.locationFound,
          circumstances: data.circumstances,
          foundConditions: data.foundConditions,
          immediateProcedures: data.immediateProcedures ?? null,
          observations: data.observations ?? null,
          createdAt: new Date(),
        }),
        tx,
      )

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId,
          rescueId: rescueRow!.id,
          employeeId: data.employeeId,
          type: AnimalHistoryType.RESCUE,
          action: 'rescue.created',
          description: 'Resgate registrado',
          oldValue: '',
          newValue: JSON.stringify({
            rescueDate: data.rescueDate,
            locationFound: data.locationFound,
            circumstances: data.circumstances,
            foundConditions: data.foundConditions,
            immediateProcedures: data.immediateProcedures ?? null,
            observations: data.observations ?? null,
            ...(isNewAnimal && data.animal ? { animal: data.animal } : {}),
          }),
          createdAt: new Date(),
        }),
        tx,
      )

      return rescueRow!.id
    })
  }
}
