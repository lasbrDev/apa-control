import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import type { CancelExpensesData } from './cancel-expenses.dto'

export class CancelExpensesUseCase {
  constructor(
    private financialTransactionRepository: FinancialTransactionRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: CancelExpensesData, employeeId: number): Promise<void> {
    const transactions = await this.financialTransactionRepository.findByIds(data.ids)
    await this.financialTransactionRepository.cancelByIds(data.ids)

    for (const transaction of transactions) {
      if (transaction.animalId) {
        await this.animalHistoryRepository.create(
          new AnimalHistory({
            animalId: transaction.animalId,
            rescueId: null,
            employeeId,
            type: AnimalHistoryType.EXPENSE,
            action: 'Despesa cancelada',
            description: transaction.description,
            oldValue: null,
            newValue: null,
            createdAt: new Date(),
          }),
          null,
        )
      }
    }
  }
}
