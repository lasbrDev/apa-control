import type { FinancialTransactionRepository } from '@/repositories/financial-transaction.repository'
import { ApiError } from '@/utils/api-error'
import { removeUploadFile } from '@/utils/files/remove-upload-file'
import type { RemoveExpenseData } from './remove-expense.dto'

export class RemoveExpenseUseCase {
  constructor(private financialTransactionRepository: FinancialTransactionRepository) {}

  async execute(data: RemoveExpenseData): Promise<void> {
    const expense = await this.financialTransactionRepository.findExpenseById(data.id)
    if (!expense) throw new ApiError('Despesa não encontrada.', 404)
    if (expense.status === 'confirmado') throw new ApiError('Não é possível remover uma despesa confirmada.', 409)

    await this.financialTransactionRepository.delete(data.id)
    await removeUploadFile(expense.proof)
  }
}
