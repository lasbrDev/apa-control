import { AnamnesisRepository } from '@/repositories/anamnesis.repository'
import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AppointmentRepository } from '@/repositories/appointment.repository'
import { ClinicalProcedureRepository } from '@/repositories/clinical-procedure.repository'
import { RemoveAppointmentUseCase } from './remove-appointment'

export function makeRemoveAppointmentUseCase() {
  return new RemoveAppointmentUseCase(
    new AppointmentRepository(),
    new AnamnesisRepository(),
    new ClinicalProcedureRepository(),
    new AnimalHistoryRepository(),
  )
}
