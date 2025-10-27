import type { TransactionTypeRepository } from '@/repositories/transaction-type.repository'
import { ApiError } from '@/utils/api-error'
import type { GetTransactionTypeByIdDTO, GetTransactionTypeByIdData } from './get-transaction-type-by-id.dto'

export class GetTransactionTypeByIdUseCase {
  constructor(private transactionTypeRepository: TransactionTypeRepository) {}

  async execute(data: GetTransactionTypeByIdData): Promise<GetTransactionTypeByIdDTO> {
    const transactionType = await this.transactionTypeRepository.findById(data.id)

    if (!transactionType) {
      throw new ApiError('Nenhum tipo de transação encontrado.', 404)
    }

    return {
      id: transactionType.id,
      name: transactionType.name,
      category: transactionType.category,
      description: transactionType.description,
      active: transactionType.active,
    }
  }
}
