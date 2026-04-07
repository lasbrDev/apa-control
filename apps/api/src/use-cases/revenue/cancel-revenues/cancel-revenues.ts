import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import type { CancelRevenuesData } from './cancel-revenues.dto'

export class CancelRevenuesUseCase {
  constructor(private financialTransactionRepository: FinancialTransactionRepository) {}

  async execute(data: CancelRevenuesData): Promise<void> {
    await this.financialTransactionRepository.cancelByIds(data.ids)
  }
}
