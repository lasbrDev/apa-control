import { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { CancelRevenuesUseCase } from './cancel-revenues'

export function makeCancelRevenuesUseCase() {
  return new CancelRevenuesUseCase(new FinancialTransactionRepository())
}
