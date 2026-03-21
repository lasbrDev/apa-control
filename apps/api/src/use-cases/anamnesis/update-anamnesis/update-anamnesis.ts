import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnamnesisRepository } from '@/repositories/anamnesis.repository'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AppointmentRepository } from '@/repositories/appointment.repository'
import { ApiError } from '@/utils/api-error'
import type { UpdateAnamnesisData } from './update-anamnesis.dto'

export class UpdateAnamnesisUseCase {
  constructor(
    private anamnesisRepository: AnamnesisRepository,
    private appointmentRepository: AppointmentRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: UpdateAnamnesisData, employeeId: number): Promise<void> {
    const existing = await this.anamnesisRepository.findById(data.id)
    if (!existing) throw new ApiError('Anamnese não encontrada.', 404)

    const [appointment, duplicateByAppointment] = await Promise.all([
      this.appointmentRepository.findById(data.appointmentId),
      this.anamnesisRepository.findByAppointmentIdExceptId(data.appointmentId, data.id),
    ])

    if (!appointment) throw new ApiError('Consulta não encontrada.', 404)
    if (duplicateByAppointment) throw new ApiError('Esta consulta já possui anamnese registrada.', 409)

    const oldValues = {
      appointmentId: existing.appointmentId,
      symptomsPresented: existing.symptomsPresented,
      dietaryHistory: existing.dietaryHistory ?? null,
      behavioralHistory: existing.behavioralHistory ?? null,
      requestedExams: existing.requestedExams ?? null,
      presumptiveDiagnosis: existing.presumptiveDiagnosis ?? null,
      observations: existing.observations ?? null,
    }
    const newValues = {
      appointmentId: data.appointmentId,
      symptomsPresented: data.symptomsPresented,
      dietaryHistory: data.dietaryHistory ?? null,
      behavioralHistory: data.behavioralHistory ?? null,
      requestedExams: data.requestedExams ?? null,
      presumptiveDiagnosis: data.presumptiveDiagnosis ?? null,
      observations: data.observations ?? null,
    }

    await db.transaction(async (tx) => {
      await this.anamnesisRepository.update(
        data.id,
        {
          appointmentId: data.appointmentId,
          symptomsPresented: data.symptomsPresented,
          dietaryHistory: data.dietaryHistory ?? null,
          behavioralHistory: data.behavioralHistory ?? null,
          requestedExams: data.requestedExams ?? null,
          presumptiveDiagnosis: data.presumptiveDiagnosis ?? null,
          observations: data.observations ?? null,
        },
        tx,
      )

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: appointment.animalId,
          rescueId: null,
          employeeId,
          type: AnimalHistoryType.CONSULTATION,
          action: 'anamnesis.updated',
          description: 'Anamnese atualizada',
          oldValue: JSON.stringify(oldValues),
          newValue: JSON.stringify(newValues),
          createdAt: new Date(),
        }),
        tx,
      )
    })
  }
}
