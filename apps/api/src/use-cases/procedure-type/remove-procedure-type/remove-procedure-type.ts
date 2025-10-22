import type { DrizzleTransaction } from '@/database/types'
import type { ProcedureTypeRepository } from '@/repositories/procedure-type.repository'
import { ApiError } from '@/utils/api-error'
import type { RemoveProcedureTypeData } from './remove-procedure-type.dto'

export class RemoveProcedureTypeUseCase {
  constructor(private procedureTypeRepository: ProcedureTypeRepository) {}

  async execute(data: RemoveProcedureTypeData, dbTransaction: DrizzleTransaction) {
    const procedureType = await this.procedureTypeRepository.findById(data.id)

    if (!procedureType) {
      throw new ApiError('Nenhum tipo de procedimento encontrado.', 404)
    }

    await this.procedureTypeRepository.remove(procedureType.id, dbTransaction)
  }
}
