import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { ConfirmPaymentExpensesUseCase } from './confirm-payment-expenses'

export function makeConfirmPaymentExpensesUseCase() {
  return new ConfirmPaymentExpensesUseCase(new FinancialTransactionRepository(), new AnimalHistoryRepository())
}
