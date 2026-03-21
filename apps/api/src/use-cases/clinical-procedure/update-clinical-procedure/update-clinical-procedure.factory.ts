import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { AppointmentRepository } from '@/repositories/appointment.repository'
import { ClinicalProcedureRepository } from '@/repositories/clinical-procedure.repository'
import { ProcedureTypeRepository } from '@/repositories/procedure-type.repository'
import { UpdateClinicalProcedureUseCase } from './update-clinical-procedure'

export function makeUpdateClinicalProcedureUseCase() {
  return new UpdateClinicalProcedureUseCase(
    new ClinicalProcedureRepository(),
    new ProcedureTypeRepository(),
    new AnimalRepository(),
    new AppointmentRepository(),
    new AnimalHistoryRepository(),
  )
}
