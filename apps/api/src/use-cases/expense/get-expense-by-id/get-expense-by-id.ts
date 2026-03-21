import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import type { ExpenseWithDetails } from '@/use-cases/expense/list-expenses/list-expenses.dto'
import type { GetExpenseByIdData } from './get-expense-by-id.dto'

export class GetExpenseByIdUseCase {
  constructor(private financialTransactionRepository: FinancialTransactionRepository) {}

  async execute(data: GetExpenseByIdData): Promise<ExpenseWithDetails> {
    return await this.financialTransactionRepository.findExpenseByIdOrThrow(data.id)
  }
}
