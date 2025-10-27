import type { TransactionTypeRepository } from '@/repositories/transaction-type.repository'
import { ApiError } from '@/utils/api-error'
import type { UpdateTransactionTypeData } from './update-transaction-type.dto'

export class UpdateTransactionTypeUseCase {
  constructor(private transactionTypeRepository: TransactionTypeRepository) {}

  async execute(data: UpdateTransactionTypeData): Promise<void> {
    const oldData = await this.transactionTypeRepository.findById(data.id)

    if (!oldData) {
      throw new ApiError('Tipo de transação não encontrado.', 404)
    }

    await this.transactionTypeRepository.update(data.id, {
      name: data.name,
      category: data.category,
      description: data.description,
      active: data.active,
    })
  }
}
