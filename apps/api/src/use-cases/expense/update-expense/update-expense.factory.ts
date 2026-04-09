import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { CampaignRepository } from '@/repositories/campaign.repository'
import { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { TransactionTypeRepository } from '@/repositories/transaction-type.repository'
import { UpdateExpenseUseCase } from './update-expense'

export function makeUpdateExpenseUseCase() {
  return new UpdateExpenseUseCase(
    new FinancialTransactionRepository(),
    new TransactionTypeRepository(),
    new CampaignRepository(),
    new AnimalRepository(),
    new AnimalHistoryRepository(),
  )
}
