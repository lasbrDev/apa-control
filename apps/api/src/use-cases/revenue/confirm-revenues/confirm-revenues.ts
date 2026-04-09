import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { ApiError } from '@/utils/api-error'
import type { ConfirmRevenuesData } from './confirm-revenues.dto'

export class ConfirmRevenuesUseCase {
  constructor(
    private financialTransactionRepository: FinancialTransactionRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: ConfirmRevenuesData, employeeId: number): Promise<void> {
    const transactions = await Promise.all(
      data.ids.map((id) => this.financialTransactionRepository.findRevenueByIdOrThrow(id)),
    )

    if (transactions.some((transaction) => transaction.status !== 'estornado')) {
      throw new ApiError('Apenas receitas estornadas podem ser confirmadas.', 409)
    }

    await this.financialTransactionRepository.confirmPaymentByIds(data.ids)

    for (const transaction of transactions) {
      if (transaction.animalId) {
        await this.animalHistoryRepository.create(
          new AnimalHistory({
            animalId: transaction.animalId,
            rescueId: null,
            employeeId,
            type: AnimalHistoryType.REVENUE,
            action: 'revenue.confirmed',
            description: `Receita ${transaction.description} confirmada`,
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
