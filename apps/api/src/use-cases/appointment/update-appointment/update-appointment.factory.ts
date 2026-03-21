import { AnamnesisRepository } from '@/repositories/anamnesis.repository'
import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { AppointmentTypeRepository } from '@/repositories/appointment-type.repository'
import { AppointmentRepository } from '@/repositories/appointment.repository'
import { ClinicalProcedureRepository } from '@/repositories/clinical-procedure.repository'
import { VeterinaryClinicRepository } from '@/repositories/veterinary-clinic.repository'
import { UpdateAppointmentUseCase } from './update-appointment'

export function makeUpdateAppointmentUseCase() {
  return new UpdateAppointmentUseCase(
    new AppointmentRepository(),
    new AppointmentTypeRepository(),
    new AnimalRepository(),
    new VeterinaryClinicRepository(),
    new AnamnesisRepository(),
    new ClinicalProcedureRepository(),
    new AnimalHistoryRepository(),
  )
}
