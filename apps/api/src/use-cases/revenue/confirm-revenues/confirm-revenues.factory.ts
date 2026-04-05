import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { ConfirmRevenuesUseCase } from './confirm-revenues'

export function makeConfirmRevenuesUseCase() {
  return new ConfirmRevenuesUseCase(new FinancialTransactionRepository(), new AnimalHistoryRepository())
}
