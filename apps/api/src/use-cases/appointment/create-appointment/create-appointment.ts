import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AppointmentStatus } from '@/database/schema/enums/appointment-status'
import { ConsultationType } from '@/database/schema/enums/consultation-type'
import { AnimalHistory, Appointment } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { AppointmentTypeRepository } from '@/repositories/appointment-type.repository'
import type { AppointmentRepository } from '@/repositories/appointment.repository'
import type { VeterinaryClinicRepository } from '@/repositories/veterinary-clinic.repository'
import { ApiError } from '@/utils/api-error'
import type { CreateAppointmentData } from './create-appointment.dto'

export class CreateAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private appointmentTypeRepository: AppointmentTypeRepository,
    private animalRepository: AnimalRepository,
    private veterinaryClinicRepository: VeterinaryClinicRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: CreateAppointmentData, employeeId: number): Promise<number> {
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

    return await db.transaction(async (tx) => {
      const [result] = await this.appointmentRepository.create(
        new Appointment({
          animalId: data.animalId,
          appointmentTypeId: data.appointmentTypeId,
          clinicId: data.clinicId ?? null,
          employeeId,
          appointmentDate,
          consultationType: data.consultationType,
          status: data.status ?? AppointmentStatus.SCHEDULED,
          observations: data.observations ?? null,
          createdAt: new Date(),
          updatedAt: null,
        }),
        tx,
      )

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: data.animalId,
          rescueId: null,
          employeeId,
          type: AnimalHistoryType.CONSULTATION,
          action: 'appointment.created',
          description: 'Consulta registrada',
          oldValue: '',
          newValue: JSON.stringify({
            appointmentTypeId: data.appointmentTypeId,
            clinicId: data.clinicId ?? null,
            appointmentDate: appointmentDate.toISOString(),
            consultationType: data.consultationType,
            status: data.status ?? AppointmentStatus.SCHEDULED,
            observations: data.observations ?? null,
          }),
          createdAt: new Date(),
        }),
        tx,
      )

      return result!.id
    })
  }
}
