import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { Anamnesis, AnimalHistory } from '@/entities'
import type { AnamnesisRepository } from '@/repositories/anamnesis.repository'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AppointmentRepository } from '@/repositories/appointment.repository'
import { ApiError } from '@/utils/api-error'
import type { CreateAnamnesisData } from './create-anamnesis.dto'

export class CreateAnamnesisUseCase {
  constructor(
    private anamnesisRepository: AnamnesisRepository,
    private appointmentRepository: AppointmentRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: CreateAnamnesisData, employeeId: number): Promise<number> {
    const [appointment, existingByAppointment] = await Promise.all([
      this.appointmentRepository.findById(data.appointmentId),
      this.anamnesisRepository.findByAppointmentId(data.appointmentId),
    ])

    if (!appointment) throw new ApiError('Consulta não encontrada.', 404)
    if (existingByAppointment) throw new ApiError('Esta consulta já possui anamnese registrada.', 409)

    return await db.transaction(async (tx) => {
      const [result] = await this.anamnesisRepository.create(
        new Anamnesis({
          appointmentId: data.appointmentId,
          symptomsPresented: data.symptomsPresented,
          dietaryHistory: data.dietaryHistory ?? null,
          behavioralHistory: data.behavioralHistory ?? null,
          requestedExams: data.requestedExams ?? null,
          presumptiveDiagnosis: data.presumptiveDiagnosis ?? null,
          observations: data.observations ?? null,
          createdAt: new Date(),
        }),
        tx,
      )

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: appointment.animalId,
          rescueId: null,
          employeeId,
          type: AnimalHistoryType.CONSULTATION,
          action: 'anamnesis.created',
          description: 'Anamnese registrada',
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
