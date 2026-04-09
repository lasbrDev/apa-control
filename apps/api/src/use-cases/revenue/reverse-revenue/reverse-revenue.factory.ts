import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { ReverseRevenueUseCase } from './reverse-revenue'

export function makeReverseRevenueUseCase() {
  return new ReverseRevenueUseCase(new FinancialTransactionRepository(), new AnimalHistoryRepository())
}
