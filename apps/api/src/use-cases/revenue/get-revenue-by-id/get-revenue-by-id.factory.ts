import { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { GetRevenueByIdUseCase } from './get-revenue-by-id'

export function makeGetRevenueByIdUseCase() {
  return new GetRevenueByIdUseCase(new FinancialTransactionRepository())
}
