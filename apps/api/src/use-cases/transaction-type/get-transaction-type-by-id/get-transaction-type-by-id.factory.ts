import { TransactionTypeRepository } from '@/repositories/transaction-type.repository'
import { GetTransactionTypeByIdUseCase } from '@/use-cases/transaction-type/get-transaction-type-by-id/get-transaction-type-by-id'

export function makeGetTransactionTypeByIdUseCase() {
  const transactionTypeRepository = new TransactionTypeRepository()
  const getTransactionTypeByIdUseCase = new GetTransactionTypeByIdUseCase(transactionTypeRepository)

  return getTransactionTypeByIdUseCase
}
