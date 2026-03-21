import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import type { ExpenseWithDetails, ListExpensesData } from './list-expenses.dto'

export class ListExpensesUseCase {
  constructor(private financialTransactionRepository: FinancialTransactionRepository) {}

  async execute(data: ListExpensesData): Promise<[number, ExpenseWithDetails[]]> {
    return await this.financialTransactionRepository.listExpenses(data)
  }
}
