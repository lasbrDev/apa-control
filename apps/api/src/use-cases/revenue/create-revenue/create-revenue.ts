import Decimal from 'decimal.js'

import { TransactionCategory } from '@/database/schema/enums/transaction-category'
import { FinancialTransaction } from '@/entities'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { CampaignRepository } from '@/repositories/campaign.repository'
import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import type { TransactionTypeRepository } from '@/repositories/transaction-type.repository'
import { ApiError } from '@/utils/api-error'
import type { CreateRevenueData } from './create-revenue.dto'

export class CreateRevenueUseCase {
  constructor(
    private financialTransactionRepository: FinancialTransactionRepository,
    private transactionTypeRepository: TransactionTypeRepository,
    private campaignRepository: CampaignRepository,
    private animalRepository: AnimalRepository,
  ) {}

  async execute(data: CreateRevenueData, employeeId: number): Promise<number> {
    const transactionType = await this.transactionTypeRepository.findById(data.transactionTypeId)
    if (!transactionType) throw new ApiError('Tipo de lançamento não encontrado.', 404)
    if (!transactionType.active) throw new ApiError('Tipo de lançamento inativo.', 409)
    if (transactionType.category !== TransactionCategory.INCOME) {
      throw new ApiError('O tipo selecionado não é de receita.', 400)
    }

    if (data.campaignId) {
      const campaign = await this.campaignRepository.findById(data.campaignId)
      if (!campaign) throw new ApiError('Campanha não encontrada.', 404)
    }

    if (data.animalId) {
      const animal = await this.animalRepository.findById(data.animalId)
      if (!animal) throw new ApiError('Animal não encontrado.', 404)
    }

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
        status: data.status,
        createdAt: new Date(),
      }),
      null,
    )

    return result!.id
  }
}
