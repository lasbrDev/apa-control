import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import type { ConfirmPaymentExpensesData } from './confirm-payment-expenses.dto'

export class ConfirmPaymentExpensesUseCase {
  constructor(private financialTransactionRepository: FinancialTransactionRepository) {}

  async execute(data: ConfirmPaymentExpensesData): Promise<void> {
    await this.financialTransactionRepository.confirmPaymentByIds(data.ids)
  }
}
