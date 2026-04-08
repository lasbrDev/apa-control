import { db } from '@/database/client'
import {
  adoption,
  animalHistory,
  appointment,
  clinicalProcedure,
  finalDestination,
  financialTransaction,
  occurrence,
  rescue,
} from '@/database/schema'
import type { AnimalRepository } from '@/repositories/animal.repository'
import { ApiError } from '@/utils/api-error'
import { eq } from 'drizzle-orm'
import type { RemoveAnimalData } from './remove-animal.dto'

export class RemoveAnimalUseCase {
  constructor(private animalRepository: AnimalRepository) {}

  async execute(data: RemoveAnimalData): Promise<void> {
    const animal = await this.animalRepository.findById(data.id)

    if (!animal) {
      throw new ApiError('Animal não encontrado.', 404)
    }

    const rescueExists = await db.select({ id: rescue.id }).from(rescue).where(eq(rescue.animalId, data.id)).limit(1)
    if (rescueExists.length > 0) {
      throw new ApiError('Não é possível remover o animal, pois ele foi resgatado.', 409)
    }

    const adoptionExists = await db
      .select({ id: adoption.id })
      .from(adoption)
      .where(eq(adoption.animalId, data.id))
      .limit(1)
    if (adoptionExists.length > 0) {
      throw new ApiError('Não é possível remover o animal, pois ele já foi adotado.', 409)
    }

    const appointmentExists = await db
      .select({ id: appointment.id })
      .from(appointment)
      .where(eq(appointment.animalId, data.id))
      .limit(1)
    if (appointmentExists.length > 0) {
      throw new ApiError('Não é possível remover o animal, pois ele possui consultas vinculadas.', 409)
    }

    const clinicalProcedureExists = await db
      .select({ id: clinicalProcedure.id })
      .from(clinicalProcedure)
      .where(eq(clinicalProcedure.animalId, data.id))
      .limit(1)
    if (clinicalProcedureExists.length > 0) {
      throw new ApiError('Não é possível remover o animal, pois ele já possui procedimentos clínicos vinculados.', 409)
    }

    const finalDestinationExists = await db
      .select({ id: finalDestination.id })
      .from(finalDestination)
      .where(eq(finalDestination.animalId, data.id))
      .limit(1)
    if (finalDestinationExists.length > 0) {
      throw new ApiError('Não é possível remover o animal, pois ele possui destino final registrado.', 409)
    }

    const financialTransactionExists = await db
      .select({ id: financialTransaction.id })
      .from(financialTransaction)
      .where(eq(financialTransaction.animalId, data.id))
      .limit(1)
    if (financialTransactionExists.length > 0) {
      throw new ApiError('Não é possível remover o animal, pois ele possui transações financeiras vinculadas.', 409)
    }

    const occurrenceExists = await db
      .select({ id: occurrence.id })
      .from(occurrence)
      .where(eq(occurrence.animalId, data.id))
      .limit(1)
    if (occurrenceExists.length > 0) {
      throw new ApiError('Não é possível remover o animal, pois ele possui ocorrências vinculadas.', 409)
    }

    await db.transaction(async (tx) => {
      await tx.delete(animalHistory).where(eq(animalHistory.animalId, data.id))
      await this.animalRepository.delete(data.id, tx)
    })
  }
}
