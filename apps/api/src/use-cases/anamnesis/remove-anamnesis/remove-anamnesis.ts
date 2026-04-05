import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnamnesisRepository } from '@/repositories/anamnesis.repository'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AppointmentRepository } from '@/repositories/appointment.repository'
import { ApiError } from '@/utils/api-error'
import type { RemoveAnamnesisData } from './remove-anamnesis.dto'

export class RemoveAnamnesisUseCase {
  constructor(
    private anamnesisRepository: AnamnesisRepository,
    private appointmentRepository: AppointmentRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: RemoveAnamnesisData, employeeId: number): Promise<void> {
    const existing = await this.anamnesisRepository.findById(data.id)
    if (!existing) throw new ApiError('Anamnese não encontrada.', 404)

    const appointment = await this.appointmentRepository.findById(existing.appointmentId)
    if (!appointment) throw new ApiError('Consulta não encontrada.', 404)

    const oldValues = {
      appointmentId: existing.appointmentId,
      symptomsPresented: existing.symptomsPresented,
      dietaryHistory: existing.dietaryHistory ?? null,
      behavioralHistory: existing.behavioralHistory ?? null,
      requestedExams: existing.requestedExams ?? null,
      presumptiveDiagnosis: existing.presumptiveDiagnosis ?? null,
      observations: existing.observations ?? null,
    }

    await db.transaction(async (tx) => {
      await this.anamnesisRepository.delete(data.id, tx)

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: appointment.animalId,
          rescueId: null,
          employeeId,
          type: AnimalHistoryType.CONSULTATION,
          action: 'anamnesis.deleted',
          description: 'Anamnese removida',
          oldValue: null,
          newValue: null,
          createdAt: new Date(),
        }),
        tx,
      )
    })
  }
}
