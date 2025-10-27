import { makeListTransactionTypesUseCase } from '@/use-cases/transaction-type/list-transaction-types/list-transaction-types.factory'

export async function listTransactionTypesController() {
  const listTransactionTypesUseCase = makeListTransactionTypesUseCase()
  const result = await listTransactionTypesUseCase.execute()
  return result
}
