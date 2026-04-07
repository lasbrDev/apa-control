import { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { CancelExpensesUseCase } from './cancel-expenses'

export function makeCancelExpensesUseCase() {
  return new CancelExpensesUseCase(new FinancialTransactionRepository())
}
