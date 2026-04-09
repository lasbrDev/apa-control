import Decimal from 'decimal.js'

import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { TransactionCategory } from '@/database/schema/enums/transaction-category'
import { TransactionStatus } from '@/database/schema/enums/transaction-status'
import { AnimalHistory, FinancialTransaction } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { CampaignRepository } from '@/repositories/campaign.repository'
import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import type { TransactionTypeRepository } from '@/repositories/transaction-type.repository'
import { ApiError } from '@/utils/api-error'
import type { CreateExpenseData } from './create-expense.dto'

export class CreateExpenseUseCase {
  constructor(
    private financialTransactionRepository: FinancialTransactionRepository,
    private transactionTypeRepository: TransactionTypeRepository,
    private campaignRepository: CampaignRepository,
    private animalRepository: AnimalRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: CreateExpenseData, employeeId: number): Promise<number> {
    const transactionType = await this.transactionTypeRepository.findById(data.transactionTypeId)
    if (!transactionType) throw new ApiError('Tipo de lançamento não encontrado.', 404)
    if (!transactionType.active) throw new ApiError('Tipo de lançamento inativo.', 409)
    if (transactionType.category !== TransactionCategory.EXPENSE) {
      throw new ApiError('O tipo selecionado não é de despesa.', 400)
    }

    if (data.campaignId) {
      const campaign = await this.campaignRepository.findById(data.campaignId)
      if (!campaign) throw new ApiError('Campanha não encontrada.', 404)
    }

    if (data.animalId) {
      const animal = await this.animalRepository.findById(data.animalId)
      if (!animal) throw new ApiError('Animal não encontrado.', 404)
    }

    return await db.transaction(async (tx) => {
      const [result] = await this.financialTransactionRepository.create(
        new FinancialTransaction({
          transactionTypeId: data.transactionTypeId,
          campaignId: data.campaignId ?? null,
          animalId: data.animalId ?? null,
          employeeId,
          description: data.description,
          value: new Decimal(data.value),
          proof: data.proof ?? null,
          observations: data.observations ?? null,
          dueDate: data.dueDate ?? null,
          status: TransactionStatus.PENDING,
          createdAt: new Date(),
        }),
        tx,
      )

      if (data.animalId) {
        await this.animalHistoryRepository.create(
          new AnimalHistory({
            animalId: data.animalId,
            rescueId: null,
            employeeId,
            type: AnimalHistoryType.EXPENSE,
            action: 'expense.created',
            description: `Despesa ${data.description} registrada`,
            oldValue: null,
            newValue: null,
            createdAt: new Date(),
          }),
          tx,
        )
      }

      return result!.id
    })
  }
}
