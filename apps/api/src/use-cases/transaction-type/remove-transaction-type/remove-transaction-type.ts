import type { DrizzleTransaction } from '@/database/types'
import type { TransactionTypeRepository } from '@/repositories/transaction-type.repository'
import { ApiError } from '@/utils/api-error'
import type { RemoveTransactionTypeData } from './remove-transaction-type.dto'

export class RemoveTransactionTypeUseCase {
  constructor(private transactionTypeRepository: TransactionTypeRepository) {}

  async execute(data: RemoveTransactionTypeData, dbTransaction: DrizzleTransaction) {
    const transactionType = await this.transactionTypeRepository.findById(data.id)

    if (!transactionType) {
      throw new ApiError('Nenhum tipo de transação encontrado.', 404)
    }

    await this.transactionTypeRepository.remove(transactionType.id, dbTransaction)
  }
}
