import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import type { ReverseRevenueData } from './reverse-revenue.dto'

export class ReverseRevenueUseCase {
  constructor(
    private financialTransactionRepository: FinancialTransactionRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: ReverseRevenueData, employeeId: number): Promise<void> {
    const transaction = await this.financialTransactionRepository.findRevenueByIdOrThrow(data.id)
    await this.financialTransactionRepository.reverseById(data.id)

    if (transaction.animalId) {
      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: transaction.animalId,
          rescueId: null,
          employeeId,
          type: AnimalHistoryType.REVENUE,
          action: 'revenue.reversed',
          description: `Receita ${transaction.description} estornada`,
          oldValue: null,
          newValue: null,
          createdAt: new Date(),
        }),
        null,
      )
    }
  }
}
