import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { ClinicalProcedureRepository } from '@/repositories/clinical-procedure.repository'
import { RemoveClinicalProcedureUseCase } from './remove-clinical-procedure'

export function makeRemoveClinicalProcedureUseCase() {
  return new RemoveClinicalProcedureUseCase(new ClinicalProcedureRepository(), new AnimalHistoryRepository())
}
