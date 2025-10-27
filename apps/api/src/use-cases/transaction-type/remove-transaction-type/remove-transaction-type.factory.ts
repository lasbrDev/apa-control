import { TransactionTypeRepository } from '@/repositories/transaction-type.repository'
import { RemoveTransactionTypeUseCase } from '@/use-cases/transaction-type/remove-transaction-type/remove-transaction-type'

export function makeRemoveTransactionTypeUseCase() {
  const transactionTypeRepository = new TransactionTypeRepository()
  const removeTransactionTypeUseCase = new RemoveTransactionTypeUseCase(transactionTypeRepository)

  return removeTransactionTypeUseCase
}
