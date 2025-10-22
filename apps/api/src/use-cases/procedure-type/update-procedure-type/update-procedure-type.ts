import type { ProcedureTypeRepository } from '@/repositories/procedure-type.repository'
import { ApiError } from '@/utils/api-error'
import Decimal from 'decimal.js'
import type { UpdateProcedureTypeData } from './update-procedure-type.dto'

export class UpdateProcedureTypeUseCase {
  constructor(private procedureTypeRepository: ProcedureTypeRepository) {}

  async execute(data: UpdateProcedureTypeData): Promise<void> {
    const oldData = await this.procedureTypeRepository.findById(data.id)

    if (!oldData) {
      throw new ApiError('Tipo de procedimento não encontrado.', 404)
    }

    await this.procedureTypeRepository.update(data.id, {
      name: data.name,
      description: data.description,
      category: data.category,
      averageCost: new Decimal(data.averageCost),
      active: data.active,
    })
  }
}
