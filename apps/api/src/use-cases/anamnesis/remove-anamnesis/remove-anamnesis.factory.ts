import { AnamnesisRepository } from '@/repositories/anamnesis.repository'
import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AppointmentRepository } from '@/repositories/appointment.repository'
import { RemoveAnamnesisUseCase } from './remove-anamnesis'

export function makeRemoveAnamnesisUseCase() {
  return new RemoveAnamnesisUseCase(
    new AnamnesisRepository(),
    new AppointmentRepository(),
    new AnimalHistoryRepository(),
  )
}
