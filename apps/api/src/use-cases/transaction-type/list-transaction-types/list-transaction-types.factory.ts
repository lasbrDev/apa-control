import { TransactionTypeRepository } from '@/repositories/transaction-type.repository'
import { ListTransactionTypesUseCase } from '@/use-cases/transaction-type/list-transaction-types/list-transaction-types'

export function makeListTransactionTypesUseCase() {
  const transactionTypeRepository = new TransactionTypeRepository()
  const listTransactionTypesUseCase = new ListTransactionTypesUseCase(transactionTypeRepository)

  return listTransactionTypesUseCase
}
