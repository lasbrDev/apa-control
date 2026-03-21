import type { ClinicalProcedureRepository } from '@/repositories/clinical-procedure.repository'
import type { ClinicalProcedureWithDetails, ListClinicalProceduresData } from './list-clinical-procedures.dto'

export class ListClinicalProceduresUseCase {
  constructor(private clinicalProcedureRepository: ClinicalProcedureRepository) {}

  async execute(data: ListClinicalProceduresData): Promise<[number, ClinicalProcedureWithDetails[]]> {
    return await this.clinicalProcedureRepository.list(data)
  }
}
