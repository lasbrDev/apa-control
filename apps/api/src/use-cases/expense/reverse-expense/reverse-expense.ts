import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import type { ReverseExpenseData } from './reverse-expense.dto'

export class ReverseExpenseUseCase {
  constructor(
    private financialTransactionRepository: FinancialTransactionRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: ReverseExpenseData, employeeId: number): Promise<void> {
    const transaction = await this.financialTransactionRepository.findExpenseByIdOrThrow(data.id)

    await this.financialTransactionRepository.reverseById(data.id)

    if (transaction.animalId) {
      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: transaction.animalId,
          rescueId: null,
          employeeId,
          type: AnimalHistoryType.EXPENSE,
          action: 'expense.reversed',
          description: `Despesa ${transaction.description} estornada`,
          oldValue: null,
          newValue: null,
          createdAt: new Date(),
        }),
        null,
      )
    }
  }
}
