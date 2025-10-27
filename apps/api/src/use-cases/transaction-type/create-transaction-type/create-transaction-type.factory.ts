import { TransactionTypeRepository } from '@/repositories/transaction-type.repository'
import { CreateTransactionTypeUseCase } from '@/use-cases/transaction-type/create-transaction-type/create-transaction-type'

export function makeCreateTransactionTypeUseCase() {
  const transactionTypeRepository = new TransactionTypeRepository()
  const createTransactionTypeUseCase = new CreateTransactionTypeUseCase(transactionTypeRepository)

  return createTransactionTypeUseCase
}
