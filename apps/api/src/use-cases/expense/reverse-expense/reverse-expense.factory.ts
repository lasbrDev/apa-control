import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { ReverseExpenseUseCase } from './reverse-expense'

export function makeReverseExpenseUseCase() {
  return new ReverseExpenseUseCase(new FinancialTransactionRepository(), new AnimalHistoryRepository())
}
