import { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { ListRevenuesUseCase } from './list-revenues'

export function makeListRevenuesUseCase() {
  return new ListRevenuesUseCase(new FinancialTransactionRepository())
}
