import { ClinicalProcedureRepository } from '@/repositories/clinical-procedure.repository'
import { ListClinicalProceduresUseCase } from './list-clinical-procedures'

export function makeListClinicalProceduresUseCase() {
  return new ListClinicalProceduresUseCase(new ClinicalProcedureRepository())
}
