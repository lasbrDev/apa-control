import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AppointmentStatus } from '@/database/schema/enums/appointment-status'
import { AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AppointmentReminderRepository } from '@/repositories/appointment-reminder.repository'
import type { AppointmentTypeRepository } from '@/repositories/appointment-type.repository'
import type { AppointmentRepository } from '@/repositories/appointment.repository'
import { ApiError } from '@/utils/api-error'
import type { ConfirmAppointmentsData } from './confirm-appointments.dto'

export class ConfirmAppointmentsUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private appointmentReminderRepository: AppointmentReminderRepository,
    private appointmentTypeRepository: AppointmentTypeRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: ConfirmAppointmentsData, employeeId: number): Promise<void> {
    const appointments = await this.appointmentRepository.findByIds(data.ids)

    if (appointments.length !== data.ids.length) {
      throw new ApiError('Uma ou mais consultas não foram encontradas.', 404)
    }

    if (appointments.some((appointment) => appointment.status !== AppointmentStatus.SCHEDULED)) {
      throw new ApiError('Apenas consultas agendadas podem ser confirmadas como realizadas.', 409)
    }

    const appointmentTypes = await Promise.all(
      [...new Set(appointments.map((appointment) => appointment.appointmentTypeId))].map(async (id) => {
        const appointmentType = await this.appointmentTypeRepository.findById(id)
        return [id, appointmentType?.name ?? `#${id}`] as const
      }),
    )
    const appointmentTypeById = new Map(appointmentTypes)

    await db.transaction(async (tx) => {
      await this.appointmentRepository.updateStatusByIds(data.ids, AppointmentStatus.COMPLETED, tx)
      await this.appointmentReminderRepository.deleteByAppointmentIds(data.ids, tx)

      for (const appointment of appointments) {
        await this.animalHistoryRepository.create(
          new AnimalHistory({
            animalId: appointment.animalId,
            rescueId: null,
            employeeId,
            type: AnimalHistoryType.CONSULTATION,
            action: 'appointment.completed',
            description: `Consulta ${appointmentTypeById.get(appointment.appointmentTypeId)} realizada`,
            oldValue: null,
            newValue: null,
            createdAt: new Date(),
          }),
          tx,
        )
      }
    })
  }
}
