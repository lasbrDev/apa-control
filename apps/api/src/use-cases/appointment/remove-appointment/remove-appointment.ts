import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AppointmentStatus } from '@/database/schema/enums/appointment-status'
import { AnimalHistory } from '@/entities'
import type { AnamnesisRepository } from '@/repositories/anamnesis.repository'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AppointmentReminderRepository } from '@/repositories/appointment-reminder.repository'
import type { AppointmentTypeRepository } from '@/repositories/appointment-type.repository'
import type { AppointmentRepository } from '@/repositories/appointment.repository'
import type { ClinicalProcedureRepository } from '@/repositories/clinical-procedure.repository'
import { ApiError } from '@/utils/api-error'
import type { RemoveAppointmentData } from './remove-appointment.dto'

export class RemoveAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private appointmentReminderRepository: AppointmentReminderRepository,
    private appointmentTypeRepository: AppointmentTypeRepository,
    private anamnesisRepository: AnamnesisRepository,
    private clinicalProcedureRepository: ClinicalProcedureRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: RemoveAppointmentData, employeeId: number): Promise<void> {
    const existing = await this.appointmentRepository.findById(data.id)
    if (!existing) throw new ApiError('Consulta não encontrada.', 404)
    if (existing.status !== AppointmentStatus.SCHEDULED) {
      throw new ApiError('Apenas consultas agendadas podem ser removidas.', 409)
    }
    const appointmentType = await this.appointmentTypeRepository.findById(existing.appointmentTypeId)

    const [anamnesisCount, procedureCount] = await Promise.all([
      this.anamnesisRepository.countByAppointmentId(data.id),
      this.clinicalProcedureRepository.countByAppointmentId(data.id),
    ])

    if (anamnesisCount > 0 || procedureCount > 0) {
      throw new ApiError(
        'Não é possível remover a consulta porque existem anamnese/procedimentos clínicos vinculados.',
        409,
      )
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

    await db.transaction(async (tx) => {
      await this.appointmentReminderRepository.deleteByAppointmentIds([data.id], tx)
      await this.appointmentRepository.delete(data.id, tx)

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: existing.animalId,
          rescueId: null,
          employeeId,
          type: AnimalHistoryType.CONSULTATION,
          action: 'appointment.deleted',
          description: `Consulta ${appointmentType?.name ?? `#${existing.appointmentTypeId}`} removida`,
          oldValue: null,
          newValue: null,
          createdAt: new Date(),
        }),
        tx,
      )
    })
  }
}
