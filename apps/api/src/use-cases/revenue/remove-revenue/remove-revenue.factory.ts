import { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { RemoveRevenueUseCase } from './remove-revenue'

export function makeRemoveRevenueUseCase() {
  return new RemoveRevenueUseCase(new FinancialTransactionRepository())
}
