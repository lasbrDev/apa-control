import { AnimalRepository } from '@/repositories/animal.repository'
import { CampaignRepository } from '@/repositories/campaign.repository'
import { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { TransactionTypeRepository } from '@/repositories/transaction-type.repository'
import { UpdateRevenueUseCase } from './update-revenue'

export function makeUpdateRevenueUseCase() {
  return new UpdateRevenueUseCase(
    new FinancialTransactionRepository(),
    new TransactionTypeRepository(),
    new CampaignRepository(),
    new AnimalRepository(),
  )
}
