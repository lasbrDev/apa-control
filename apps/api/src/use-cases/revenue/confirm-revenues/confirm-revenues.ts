import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import type { ConfirmRevenuesData } from './confirm-revenues.dto'

export class ConfirmRevenuesUseCase {
  constructor(private financialTransactionRepository: FinancialTransactionRepository) {}

  async execute(data: ConfirmRevenuesData): Promise<void> {
    await this.financialTransactionRepository.confirmRevenuesByIds(data.ids)
  }
}
