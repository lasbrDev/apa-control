import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { ConsultationType } from '@/database/schema/enums/consultation-type'
import { AnimalHistory } from '@/entities'
import type { AnamnesisRepository } from '@/repositories/anamnesis.repository'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { AppointmentTypeRepository } from '@/repositories/appointment-type.repository'
import type { AppointmentRepository } from '@/repositories/appointment.repository'
import type { ClinicalProcedureRepository } from '@/repositories/clinical-procedure.repository'
import type { VeterinaryClinicRepository } from '@/repositories/veterinary-clinic.repository'
import { ApiError } from '@/utils/api-error'
import type { UpdateAppointmentData } from './update-appointment.dto'

export class UpdateAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private appointmentTypeRepository: AppointmentTypeRepository,
    private animalRepository: AnimalRepository,
    private veterinaryClinicRepository: VeterinaryClinicRepository,
    private anamnesisRepository: AnamnesisRepository,
    private clinicalProcedureRepository: ClinicalProcedureRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: UpdateAppointmentData, employeeId: number): Promise<void> {
    const existing = await this.appointmentRepository.findById(data.id)
    if (!existing) throw new ApiError('Consulta não encontrada.', 404)

    const [animal, appointmentType] = await Promise.all([
      this.animalRepository.findById(data.animalId),
      this.appointmentTypeRepository.findById(data.appointmentTypeId),
    ])
    if (!animal) throw new ApiError('Animal não encontrado.', 404)
    if (!appointmentType) throw new ApiError('Tipo de consulta não encontrado.', 404)
    if (!appointmentType.active) throw new ApiError('Tipo de consulta inativo.', 409)

    if (data.consultationType === ConsultationType.CLINICAL && !data.clinicId) {
      throw new ApiError('Clínica é obrigatória para consulta clínica.', 400)
    }

    if (data.clinicId) {
      const clinic = await this.veterinaryClinicRepository.findById(data.clinicId)
      if (!clinic) throw new ApiError('Clínica não encontrada.', 404)
      if (!clinic.active) throw new ApiError('Clínica inativa.', 409)
    }

    const appointmentDate = new Date(data.appointmentDate)
    if (Number.isNaN(appointmentDate.getTime())) throw new ApiError('Data/hora da consulta inválida.', 400)

    if (existing.animalId !== data.animalId) {
      const [anamnesisCount, procedureCount] = await Promise.all([
        this.anamnesisRepository.countByAppointmentId(data.id),
        this.clinicalProcedureRepository.countByAppointmentId(data.id),
      ])

      if (anamnesisCount > 0 || procedureCount > 0) {
        throw new ApiError(
          'Não é permitido alterar o animal da consulta quando existem anamnese/procedimentos vinculados.',
          409,
        )
      }
    }

    const oldValues = {
      animalId: existing.animalId,
      appointmentTypeId: existing.appointmentTypeId,
      clinicId: existing.clinicId ?? null,
      appointmentDate: existing.appointmentDate,
      consultationType: existing.consultationType,
      status: existing.status,
      observations: existing.observations ?? null,
    }

    const newValues = {
      animalId: data.animalId,
      appointmentTypeId: data.appointmentTypeId,
      clinicId: data.clinicId ?? null,
      appointmentDate: appointmentDate.toISOString(),
      consultationType: data.consultationType,
      status: data.status,
      observations: data.observations ?? null,
    }

    await db.transaction(async (tx) => {
      await this.appointmentRepository.update(
        data.id,
        {
          animalId: data.animalId,
          appointmentTypeId: data.appointmentTypeId,
          clinicId: data.clinicId ?? null,
          appointmentDate,
          consultationType: data.consultationType,
          status: data.status,
          observations: data.observations ?? null,
          updatedAt: new Date(),
        },
        tx,
      )

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: data.animalId,
          rescueId: null,
          employeeId,
          type: AnimalHistoryType.CONSULTATION,
          action: 'appointment.updated',
          description: 'Consulta atualizada',
          oldValue: JSON.stringify(oldValues),
          newValue: JSON.stringify(newValues),
          createdAt: new Date(),
        }),
        tx,
      )
    })
  }
}
