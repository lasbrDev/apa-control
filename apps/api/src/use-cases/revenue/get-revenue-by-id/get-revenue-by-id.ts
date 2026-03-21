import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import type { RevenueWithDetails } from '@/use-cases/revenue/list-revenues/list-revenues.dto'
import type { GetRevenueByIdData } from './get-revenue-by-id.dto'

export class GetRevenueByIdUseCase {
  constructor(private financialTransactionRepository: FinancialTransactionRepository) {}

  async execute(data: GetRevenueByIdData): Promise<RevenueWithDetails> {
    return await this.financialTransactionRepository.findRevenueByIdOrThrow(data.id)
  }
}
