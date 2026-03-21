import { AnamnesisRepository } from '@/repositories/anamnesis.repository'
import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AppointmentRepository } from '@/repositories/appointment.repository'
import { UpdateAnamnesisUseCase } from './update-anamnesis'

export function makeUpdateAnamnesisUseCase() {
  return new UpdateAnamnesisUseCase(
    new AnamnesisRepository(),
    new AppointmentRepository(),
    new AnimalHistoryRepository(),
  )
}
