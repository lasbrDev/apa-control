import type { ProcedureTypeRepository } from '@/repositories'
import type { ListProcedureTypesDTO } from './list-procedure-types.dto'

export class ListProcedureTypesUseCase {
  constructor(private procedureTypeRepository: ProcedureTypeRepository) {}

  async execute(): Promise<ListProcedureTypesDTO[]> {
    const items = await this.procedureTypeRepository.list()
    return items
  }
}
