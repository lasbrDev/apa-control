import type { ClinicalProcedureRepository } from '@/repositories/clinical-procedure.repository'
import type { ClinicalProcedureWithDetails } from '../list-clinical-procedures/list-clinical-procedures.dto'
import type { GetClinicalProcedureByIdData } from './get-clinical-procedure-by-id.dto'

export class GetClinicalProcedureByIdUseCase {
  constructor(private clinicalProcedureRepository: ClinicalProcedureRepository) {}

  async execute(data: GetClinicalProcedureByIdData): Promise<ClinicalProcedureWithDetails> {
    return await this.clinicalProcedureRepository.findByIdOrThrow(data.id)
  }
}
