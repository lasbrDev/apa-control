import type { ProcedureTypeRepository } from '@/repositories/procedure-type.repository'
import { ApiError } from '@/utils/api-error'
import type { GetProcedureTypeByIdDTO, GetProcedureTypeByIdData } from './get-procedure-type-by-id.dto'

export class GetProcedureTypeByIdUseCase {
  constructor(private procedureTypeRepository: ProcedureTypeRepository) {}

  async execute(data: GetProcedureTypeByIdData): Promise<GetProcedureTypeByIdDTO> {
    const procedureType = await this.procedureTypeRepository.findById(data.id)

    if (!procedureType) {
      throw new ApiError('Nenhum tipo de procedimento encontrado.', 404)
    }

    return {
      id: procedureType.id,
      name: procedureType.name,
      description: procedureType.description,
      category: procedureType.category,
      averageCost: Number(procedureType.averageCost),
      active: procedureType.active,
    }
  }
}
