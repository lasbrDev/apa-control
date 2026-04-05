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

      let hasExist = false

      if (data.animalId) {
        hasExist = await this.rescueRepository.findExistingRescue(data.animalId)
      }

      if (hasExist) {
        throw new ApiError('Já existe um resgate registrado para este animal.', 400)
      }

      if (data.animalId != null) {
        const animal = await this.animalRepository.findById(data.animalId)
        if (!animal) {
          throw new ApiError('Animal não encontrado.', 404)
        }
        if (animal.rescueAt != null) {
          throw new ApiError('Este animal já possui um resgate ativo.', 400)
        }
        animalId = data.animalId
      } else if (data.animal) {
        const [animalRow] = await this.animalRepository.create(
          new Animal({
            ...data.animal!,
            birthYear: data.animal!.birthYear ?? null,
            status: 'ativo',
            rescueAt: new Date(),
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
            oldValue: null,
            newValue: null,
            createdAt: new Date(),
          }),
          tx,
        )
      } else {
        throw new ApiError('Informe o animal (animalId ou dados do animal) para registrar o resgate.', 400)
      }

      if (!isNewAnimal) {
        await this.animalRepository.update(animalId, { status: 'ativo', rescueAt: new Date() }, tx)
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
          oldValue: null,
          newValue: null,
          createdAt: new Date(),
        }),
        tx,
      )

      return rescueRow!.id
    })
  }
}
