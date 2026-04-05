import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { cancelExpensesController } from './cancel-expenses/cancel-expenses.controller'
import { confirmPaymentExpensesController } from './confirm-payment-expenses/confirm-payment-expenses.controller'
import { createExpenseController } from './create-expense/create-expense.controller'
import { getExpenseByIdController } from './get-expense-by-id/get-expense-by-id.controller'
import { listExpensesController } from './list-expenses/list-expenses.controller'
import { removeExpenseController } from './remove-expense/remove-expense.controller'
import { updateExpenseController } from './update-expense/update-expense.controller'

export async function expenseRoutes(app: FastifyInstance) {
  app.post('/expense.add', authorize('AdminPanel', 'Financial', 'Expenses'), createExpenseController)
  app.put('/expense.update', authorize('AdminPanel', 'Financial', 'Expenses'), updateExpenseController)
  app.get('/expense.list', authorize('AdminPanel', 'Financial', 'Expenses'), listExpensesController)
  app.get('/expense.key/:id', authorize('AdminPanel', 'Financial', 'Expenses'), getExpenseByIdController)
  app.delete('/expense.delete/:id', authorize('AdminPanel', 'Financial', 'Expenses'), removeExpenseController)
  app.post('/expense.cancel', authorize('AdminPanel', 'Financial', 'Expenses'), cancelExpensesController)
  app.post(
    '/expense.confirmPayment',
    authorize('AdminPanel', 'Financial', 'Expenses'),
    confirmPaymentExpensesController,
  )
}
