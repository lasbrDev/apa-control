import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import type { ListRevenuesData, RevenueWithDetails } from './list-revenues.dto'

export class ListRevenuesUseCase {
  constructor(private financialTransactionRepository: FinancialTransactionRepository) {}

  async execute(data: ListRevenuesData): Promise<[number, RevenueWithDetails[]]> {
    return await this.financialTransactionRepository.listRevenues(data)
  }
}
