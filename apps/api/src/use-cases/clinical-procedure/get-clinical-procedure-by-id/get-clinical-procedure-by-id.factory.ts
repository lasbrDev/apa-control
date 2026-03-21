import { ClinicalProcedureRepository } from '@/repositories/clinical-procedure.repository'
import { GetClinicalProcedureByIdUseCase } from './get-clinical-procedure-by-id'

export function makeGetClinicalProcedureByIdUseCase() {
  return new GetClinicalProcedureByIdUseCase(new ClinicalProcedureRepository())
}
