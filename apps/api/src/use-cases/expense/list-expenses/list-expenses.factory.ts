import { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { ListExpensesUseCase } from './list-expenses'

export function makeListExpensesUseCase() {
  return new ListExpensesUseCase(new FinancialTransactionRepository())
}
