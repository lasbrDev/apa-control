import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { ClinicalProcedureRepository } from '@/repositories/clinical-procedure.repository'
import { ApiError } from '@/utils/api-error'
import type { RemoveClinicalProcedureData } from './remove-clinical-procedure.dto'

export class RemoveClinicalProcedureUseCase {
  constructor(
    private clinicalProcedureRepository: ClinicalProcedureRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: RemoveClinicalProcedureData, employeeId: number): Promise<void> {
    const existing = await this.clinicalProcedureRepository.findById(data.id)
    if (!existing) throw new ApiError('Procedimento clínico não encontrado.', 404)

    const oldValues = {
      animalId: existing.animalId,
      procedureTypeId: existing.procedureTypeId,
      appointmentId: existing.appointmentId ?? null,
      procedureDate: existing.procedureDate,
      description: existing.description,
      actualCost: existing.actualCost,
      observations: existing.observations ?? null,
      status: existing.status,
    }

    await db.transaction(async (tx) => {
      await this.clinicalProcedureRepository.delete(data.id, tx)

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: existing.animalId,
          rescueId: null,
          employeeId,
          type: AnimalHistoryType.PROCEDURE,
          action: 'clinical-procedure.deleted',
          description: 'Procedimento clínico removido',
          oldValue: JSON.stringify(oldValues),
          newValue: '',
          createdAt: new Date(),
        }),
        tx,
      )
    })
  }
}
