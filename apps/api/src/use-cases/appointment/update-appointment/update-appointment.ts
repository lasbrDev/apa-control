import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AppointmentStatus } from '@/database/schema/enums/appointment-status'
import { ConsultationType } from '@/database/schema/enums/consultation-type'
import { AnimalHistory, AppointmentReminder } from '@/entities'
import type { AnamnesisRepository } from '@/repositories/anamnesis.repository'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { AppointmentReminderRepository } from '@/repositories/appointment-reminder.repository'
import type { AppointmentTypeRepository } from '@/repositories/appointment-type.repository'
import type { AppointmentRepository } from '@/repositories/appointment.repository'
import type { ClinicalProcedureRepository } from '@/repositories/clinical-procedure.repository'
import type { VeterinaryClinicRepository } from '@/repositories/veterinary-clinic.repository'
import { ApiError } from '@/utils/api-error'
import { timeZoneName } from '@/utils/time-zone'
import { tz } from '@date-fns/tz'
import { parseISO } from 'date-fns'
import { buildAppointmentReminderMessage } from '../reminder-message'
import type { UpdateAppointmentData } from './update-appointment.dto'

export class UpdateAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private appointmentReminderRepository: AppointmentReminderRepository,
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
    if (existing.status !== AppointmentStatus.SCHEDULED) {
      throw new ApiError('Apenas consultas agendadas podem ser editadas.', 409)
    }

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

    let clinicName: string | null = null
    if (data.clinicId) {
      const clinic = await this.veterinaryClinicRepository.findById(data.clinicId)
      if (!clinic) throw new ApiError('Clínica não encontrada.', 404)
      if (!clinic.active) throw new ApiError('Clínica inativa.', 409)
      clinicName = clinic.name
    }

    const appointmentDate = parseISO(data.appointmentDate, { in: tz(timeZoneName.SP) })
    if (Number.isNaN(appointmentDate.getTime())) throw new ApiError('Data/hora da consulta inválida.', 400)
    const reminder = buildAppointmentReminderMessage({
      appointmentTypeName: appointmentType.name,
      animalName: animal.name,
      appointmentDate,
      consultationType: data.consultationType,
      clinicName,
    })

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

    const normalizedData = {
      animalId: data.animalId,
      appointmentTypeId: data.appointmentTypeId,
      clinicId: data.clinicId ?? null,
      appointmentDate,
      consultationType: data.consultationType,
      observations: data.observations ?? null,
    } as const

    const comparableExisting = {
      animalId: existing.animalId,
      appointmentTypeId: existing.appointmentTypeId,
      clinicId: existing.clinicId ?? null,
      appointmentDate: existing.appointmentDate.getTime(),
      consultationType: existing.consultationType,
      observations: existing.observations ?? null,
    } as const

    const comparableNew = {
      animalId: normalizedData.animalId,
      appointmentTypeId: normalizedData.appointmentTypeId,
      clinicId: normalizedData.clinicId,
      appointmentDate: normalizedData.appointmentDate.getTime(),
      consultationType: normalizedData.consultationType,
      observations: normalizedData.observations,
    } as const

    const changedData = (Object.keys(normalizedData) as (keyof typeof normalizedData)[]).reduce(
      (acc, key) => {
        if (JSON.stringify(comparableExisting[key]) !== JSON.stringify(comparableNew[key])) {
          return { ...acc, [key]: normalizedData[key] }
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

    if (Object.keys(changedData).length === 0) return

    await db.transaction(async (tx) => {
      await this.appointmentRepository.update(
        data.id,
        {
          animalId: data.animalId,
          appointmentTypeId: data.appointmentTypeId,
          clinicId: data.clinicId ?? null,
          appointmentDate,
          consultationType: data.consultationType,
          observations: data.observations ?? null,
          updatedAt: new Date(),
        },
        tx,
      )

      const updatedReminderCount = await this.appointmentReminderRepository.updateByAppointmentId(
        data.id,
        existing.employeeId,
        {
          title: reminder.title,
          message: reminder.message,
        },
        tx,
      )

      if (updatedReminderCount === 0) {
        await this.appointmentReminderRepository.create(
          new AppointmentReminder({
            appointmentId: data.id,
            employeeId: existing.employeeId,
            title: reminder.title,
            message: reminder.message,
            readAt: null,
            createdAt: new Date(),
          }),
          tx,
        )
      }

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: data.animalId,
          rescueId: null,
          employeeId,
          type: AnimalHistoryType.CONSULTATION,
          action: 'appointment.updated',
          description: `Consulta ${appointmentType.name} atualizada`,
          oldValue: JSON.stringify(oldValues),
          newValue: JSON.stringify(newValues),
          createdAt: new Date(),
        }),
        tx,
      )
    })
  }
}
