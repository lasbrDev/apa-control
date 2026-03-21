import { AnamnesisRepository } from '@/repositories/anamnesis.repository'
import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AppointmentRepository } from '@/repositories/appointment.repository'
import { CreateAnamnesisUseCase } from './create-anamnesis'

export function makeCreateAnamnesisUseCase() {
  return new CreateAnamnesisUseCase(
    new AnamnesisRepository(),
    new AppointmentRepository(),
    new AnimalHistoryRepository(),
  )
}
