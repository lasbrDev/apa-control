import { TransactionTypeRepository } from '@/repositories/transaction-type.repository'
import { UpdateTransactionTypeUseCase } from '@/use-cases/transaction-type/update-transaction-type/update-transaction-type'

export function makeUpdateTransactionTypeUseCase() {
  const transactionTypeRepository = new TransactionTypeRepository()
  const updateTransactionTypeUseCase = new UpdateTransactionTypeUseCase(transactionTypeRepository)

  return updateTransactionTypeUseCase
}
