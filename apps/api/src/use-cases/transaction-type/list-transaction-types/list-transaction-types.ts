import type { TransactionTypeRepository } from '@/repositories'
import type { ListTransactionTypesDTO } from './list-transaction-types.dto'

export class ListTransactionTypesUseCase {
  constructor(private transactionTypeRepository: TransactionTypeRepository) {}

  async execute(): Promise<ListTransactionTypesDTO[]> {
    const items = await this.transactionTypeRepository.list()
    return items
  }
}
