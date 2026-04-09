import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { CampaignRepository } from '@/repositories/campaign.repository'
import { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { TransactionTypeRepository } from '@/repositories/transaction-type.repository'
import { CreateRevenueUseCase } from './create-revenue'

export function makeCreateRevenueUseCase() {
  return new CreateRevenueUseCase(
    new FinancialTransactionRepository(),
    new TransactionTypeRepository(),
    new CampaignRepository(),
    new AnimalRepository(),
    new AnimalHistoryRepository(),
  )
}
