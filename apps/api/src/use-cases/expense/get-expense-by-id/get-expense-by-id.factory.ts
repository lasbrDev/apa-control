import { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { GetExpenseByIdUseCase } from './get-expense-by-id'

export function makeGetExpenseByIdUseCase() {
  return new GetExpenseByIdUseCase(new FinancialTransactionRepository())
}
