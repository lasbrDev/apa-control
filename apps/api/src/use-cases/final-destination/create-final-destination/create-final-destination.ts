import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory, FinalDestination } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { FinalDestinationTypeRepository } from '@/repositories/final-destination-type.repository'
import type { FinalDestinationRepository } from '@/repositories/final-destination.repository'
import { ApiError } from '@/utils/api-error'
import type { CreateFinalDestinationData } from './create-final-destination.dto'

export class CreateFinalDestinationUseCase {
  constructor(
    private finalDestinationRepository: FinalDestinationRepository,
    private finalDestinationTypeRepository: FinalDestinationTypeRepository,
    private animalRepository: AnimalRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: CreateFinalDestinationData): Promise<number> {
    const [animal, destinationType, alreadyExists] = await Promise.all([
      this.animalRepository.findById(data.animalId),
      this.finalDestinationTypeRepository.findById(data.destinationTypeId),
      this.finalDestinationRepository.findByAnimalId(data.animalId),
    ])

    if (!animal) throw new ApiError('Animal não encontrado.', 404)
    if (!destinationType) throw new ApiError('Tipo de destino final não encontrado.', 404)
    if (alreadyExists) throw new ApiError('Este animal já possui destino final registrado.', 409)
    if (!animal.rescueAt)
      throw new ApiError('O animal precisa ter um resgate registrado para receber destino final.', 400)

    return await db.transaction(async (tx) => {
      const [result] = await this.finalDestinationRepository.create(
        new FinalDestination({
          animalId: data.animalId,
          destinationTypeId: data.destinationTypeId,
          employeeId: data.employeeId,
          destinationDate: data.destinationDate,
          reason: data.reason,
          observations: data.observations ?? null,
          proof: data.proof ?? null,
          createdAt: new Date(),
        }),
        tx,
      )

      await this.animalRepository.update(data.animalId, { status: 'inativo' }, tx)

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: data.animalId,
          rescueId: null,
          employeeId: data.employeeId,
          type: AnimalHistoryType.FINAL_DESTINATION,
          action: 'final-destination.created',
          description: 'Destino final registrado',
          oldValue: null,
          newValue: null,
          createdAt: new Date(),
        }),
        tx,
      )

      return result!.id
    })
  }
}
