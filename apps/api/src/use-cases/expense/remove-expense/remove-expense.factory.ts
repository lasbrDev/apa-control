import { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { RemoveExpenseUseCase } from './remove-expense'

export function makeRemoveExpenseUseCase() {
  return new RemoveExpenseUseCase(new FinancialTransactionRepository())
}
