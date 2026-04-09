import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { ApiError } from '@/utils/api-error'
import { removeUploadFile } from '@/utils/files/remove-upload-file'
import type { RemoveRevenueData } from './remove-revenue.dto'

export class RemoveRevenueUseCase {
  constructor(private financialTransactionRepository: FinancialTransactionRepository) {}

  async execute(data: RemoveRevenueData): Promise<void> {
    const revenue = await this.financialTransactionRepository.findRevenueById(data.id)
    if (!revenue) throw new ApiError('Receita não encontrada.', 404)
    if (revenue.status === 'confirmado') throw new ApiError('Não é possível remover uma receita confirmada.', 409)

    await this.financialTransactionRepository.delete(data.id)
    await removeUploadFile(revenue.proof)
  }
}
