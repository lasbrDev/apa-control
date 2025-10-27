import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { createTransactionTypeController } from './create-transaction-type/create-transaction-type.controller'
import { getTransactionTypeByIdController } from './get-transaction-type-by-id/get-transaction-type-by-id.controller'
import { listTransactionTypesController } from './list-transaction-types/list-transaction-types.controller'
import { removeTransactionTypeController } from './remove-transaction-type/remove-transaction-type.controller'
import { updateTransactionTypeController } from './update-transaction-type/update-transaction-type.controller'

export async function transactionTypeRoutes(app: FastifyInstance) {
  app.post('/transaction-type.add', authorize('AdminPanel', 'TransactionTypes'), createTransactionTypeController)
  app.put('/transaction-type.update', authorize('AdminPanel', 'TransactionTypes'), updateTransactionTypeController)
  app.get('/transaction-type.list', authorize('AdminPanel', 'TransactionTypes'), listTransactionTypesController)
  app.get('/transaction-type.key/:id', authorize('AdminPanel', 'TransactionTypes'), getTransactionTypeByIdController)
  app.delete(
    '/transaction-type.delete/:id',
    authorize('AdminPanel', 'TransactionTypes'),
    removeTransactionTypeController,
  )
}
