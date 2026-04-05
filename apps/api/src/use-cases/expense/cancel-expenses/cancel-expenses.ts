import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import type { CancelExpensesData } from './cancel-expenses.dto'

export class CancelExpensesUseCase {
  constructor(private financialTransactionRepository: FinancialTransactionRepository) {}

  async execute(data: CancelExpensesData): Promise<void> {
    await this.financialTransactionRepository.cancelByIds(data.ids)
  }
}
