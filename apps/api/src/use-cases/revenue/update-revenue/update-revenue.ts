import Decimal from 'decimal.js'

import { TransactionCategory } from '@/database/schema/enums/transaction-category'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { CampaignRepository } from '@/repositories/campaign.repository'
import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import type { TransactionTypeRepository } from '@/repositories/transaction-type.repository'
import { ApiError } from '@/utils/api-error'
import { removeUploadFile } from '@/utils/files/remove-upload-file'
import type { UpdateRevenueData } from './update-revenue.dto'

export class UpdateRevenueUseCase {
  constructor(
    private financialTransactionRepository: FinancialTransactionRepository,
    private transactionTypeRepository: TransactionTypeRepository,
    private campaignRepository: CampaignRepository,
    private animalRepository: AnimalRepository,
  ) {}

  async execute(data: UpdateRevenueData): Promise<void> {
    const existing = await this.financialTransactionRepository.findRevenueById(data.id)
    if (!existing) throw new ApiError('Receita não encontrada.', 404)
    if (existing.status === 'confirmado') throw new ApiError('Não é possível editar uma receita confirmada.', 409)

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

    const proof = data.proof ?? null

    await this.financialTransactionRepository.update(data.id, {
      transactionTypeId: data.transactionTypeId,
      campaignId: data.campaignId ?? null,
      animalId: data.animalId ?? null,
      description: data.description,
      value: new Decimal(data.value),
      proof,
      observations: data.observations ?? null,
    })

    if (existing.proof && existing.proof !== proof) {
      await removeUploadFile(existing.proof)
    }
  }
}
