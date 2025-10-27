import { TransactionType } from '@/entities'
import type { TransactionTypeRepository } from '@/repositories/transaction-type.repository'
import type { CreateTransactionTypeDTO, CreateTransactionTypeData } from './create-transaction-type.dto'

export class CreateTransactionTypeUseCase {
  constructor(private transactionTypeRepository: TransactionTypeRepository) {}

  async execute(data: CreateTransactionTypeData): Promise<CreateTransactionTypeDTO> {
    const transactionType = new TransactionType({
      name: data.name,
      category: data.category,
      description: data.description,
      active: data.active,
      createdAt: new Date(),
    })

    const result = await this.transactionTypeRepository.create(transactionType)

    return { id: result.id }
  }
}
