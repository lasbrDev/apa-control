import { db } from '@/database/client'
import { financialTransaction, transactionType } from '@/database/schema'
import { TransactionCategory } from '@/database/schema/enums/transaction-category'
import type { CampaignRepository } from '@/repositories/campaign.repository'
import { ApiError } from '@/utils/api-error'
import { removeUploadFile } from '@/utils/files/remove-upload-file'
import { and, eq } from 'drizzle-orm'
import type { RemoveCampaignData } from './remove-campaign.dto'

export class RemoveCampaignUseCase {
  constructor(private campaignRepository: CampaignRepository) {}

  async execute(data: RemoveCampaignData): Promise<void> {
    const campaign = await this.campaignRepository.findById(data.id)
    if (!campaign) throw new ApiError('Campanha não encontrada.', 404)

    const expenseExists = await db
      .select({ id: financialTransaction.id })
      .from(financialTransaction)
      .innerJoin(transactionType, eq(transactionType.id, financialTransaction.transactionTypeId))
      .where(
        and(eq(financialTransaction.campaignId, data.id), eq(transactionType.category, TransactionCategory.EXPENSE)),
      )
      .limit(1)

    if (expenseExists.length > 0) {
      throw new ApiError('Não é possível remover a campanha, pois ela possui despesas vinculadas.', 409)
    }

    const revenueExists = await db
      .select({ id: financialTransaction.id })
      .from(financialTransaction)
      .innerJoin(transactionType, eq(transactionType.id, financialTransaction.transactionTypeId))
      .where(
        and(eq(financialTransaction.campaignId, data.id), eq(transactionType.category, TransactionCategory.INCOME)),
      )
      .limit(1)

    if (revenueExists.length > 0) {
      throw new ApiError('Não é possível remover a campanha, pois ela possui receitas vinculadas.', 409)
    }

    await this.campaignRepository.delete(data.id)
    await removeUploadFile(campaign.proof)
  }
}
