import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { ProcedureStatus } from '@/database/schema/enums/procedure-status'
import { AnimalHistory, ClinicalProcedure } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { AppointmentRepository } from '@/repositories/appointment.repository'
import type { ClinicalProcedureRepository } from '@/repositories/clinical-procedure.repository'
import type { ProcedureTypeRepository } from '@/repositories/procedure-type.repository'
import { ApiError } from '@/utils/api-error'
import Decimal from 'decimal.js'
import type { CreateClinicalProcedureData } from './create-clinical-procedure.dto'

export class CreateClinicalProcedureUseCase {
  constructor(
    private clinicalProcedureRepository: ClinicalProcedureRepository,
    private procedureTypeRepository: ProcedureTypeRepository,
    private animalRepository: AnimalRepository,
    private appointmentRepository: AppointmentRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: CreateClinicalProcedureData, employeeId: number): Promise<number> {
    const [animal, procedureType] = await Promise.all([
      this.animalRepository.findById(data.animalId),
      this.procedureTypeRepository.findById(data.procedureTypeId),
    ])

    if (!animal) throw new ApiError('Animal não encontrado.', 404)
    if (!procedureType) throw new ApiError('Tipo de procedimento não encontrado.', 404)
    if (!procedureType.active) throw new ApiError('Tipo de procedimento inativo.', 409)

    if (data.appointmentId) {
      const appointment = await this.appointmentRepository.findById(data.appointmentId)
      if (!appointment) throw new ApiError('Consulta não encontrada.', 404)
      if (appointment.animalId !== data.animalId) {
        throw new ApiError('A consulta informada não pertence ao animal selecionado.', 409)
      }
    }

    const procedureDate = new Date(data.procedureDate)
    if (Number.isNaN(procedureDate.getTime())) throw new ApiError('Data/hora do procedimento inválida.', 400)

    return await db.transaction(async (tx) => {
      const [result] = await this.clinicalProcedureRepository.create(
        new ClinicalProcedure({
          animalId: data.animalId,
          procedureTypeId: data.procedureTypeId,
          appointmentId: data.appointmentId ?? null,
          employeeId,
          procedureDate,
          description: data.description,
          actualCost: new Decimal(data.actualCost),
          observations: data.observations ?? null,
          status: data.status ?? ProcedureStatus.SCHEDULED,
          createdAt: new Date(),
        }),
        tx,
      )

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: data.animalId,
          rescueId: null,
          employeeId,
          type: AnimalHistoryType.PROCEDURE,
          action: 'clinical-procedure.created',
          description: 'Procedimento clínico registrado',
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
