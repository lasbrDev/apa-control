import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { AppointmentRepository } from '@/repositories/appointment.repository'
import type { ClinicalProcedureRepository } from '@/repositories/clinical-procedure.repository'
import type { ProcedureTypeRepository } from '@/repositories/procedure-type.repository'
import { ApiError } from '@/utils/api-error'
import { timeZoneName } from '@/utils/time-zone'
import { tz } from '@date-fns/tz'
import { parseISO } from 'date-fns'
import Decimal from 'decimal.js'
import type { UpdateClinicalProcedureData } from './update-clinical-procedure.dto'

export class UpdateClinicalProcedureUseCase {
  constructor(
    private clinicalProcedureRepository: ClinicalProcedureRepository,
    private procedureTypeRepository: ProcedureTypeRepository,
    private animalRepository: AnimalRepository,
    private appointmentRepository: AppointmentRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: UpdateClinicalProcedureData, employeeId: number): Promise<void> {
    const existing = await this.clinicalProcedureRepository.findById(data.id)
    if (!existing) throw new ApiError('Procedimento clínico não encontrado.', 404)

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

    const procedureDate = parseISO(data.procedureDate, { in: tz(timeZoneName.SP) })
    if (Number.isNaN(procedureDate.getTime())) throw new ApiError('Data/hora do procedimento inválida.', 400)

    const changedData = Object.entries(data).reduce(
      (acc, [key, value]) => {
        const shouldIgnoreKey = key === 'id'
        if (shouldIgnoreKey) return acc

        const oldValue = (existing as Record<string, unknown>)[key] ?? null
        const newValue = typeof value !== 'undefined' ? value : oldValue

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          return { ...acc, [key]: newValue }
        }

        return acc
      },
      {} as Record<string, unknown>,
    )

    const oldValues = Object.keys(changedData).reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = (existing as Record<string, unknown>)[key] ?? null
      return acc
    }, {})

    const newValues = Object.keys(changedData).reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = changedData[key]
      return acc
    }, {})

    await db.transaction(async (tx) => {
      await this.clinicalProcedureRepository.update(
        data.id,
        {
          animalId: data.animalId,
          procedureTypeId: data.procedureTypeId,
          appointmentId: data.appointmentId ?? null,
          procedureDate,
          description: data.description,
          actualCost: new Decimal(data.actualCost),
          observations: data.observations ?? null,
          status: data.status,
        },
        tx,
      )

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: data.animalId,
          rescueId: null,
          employeeId,
          type: AnimalHistoryType.PROCEDURE,
          action: 'clinical-procedure.updated',
          description: 'Procedimento clínico atualizado',
          oldValue: JSON.stringify(oldValues),
          newValue: JSON.stringify(newValues),
          createdAt: new Date(),
        }),
        tx,
      )
    })
  }
}
