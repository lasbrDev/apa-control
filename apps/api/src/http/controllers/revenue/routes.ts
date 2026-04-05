import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { cancelRevenuesController } from './cancel-revenues/cancel-revenues.controller'
import { confirmRevenuesController } from './confirm-revenues/confirm-revenues.controller'
import { createRevenueController } from './create-revenue/create-revenue.controller'
import { getRevenueByIdController } from './get-revenue-by-id/get-revenue-by-id.controller'
import { listRevenuesController } from './list-revenues/list-revenues.controller'
import { removeRevenueController } from './remove-revenue/remove-revenue.controller'
import { updateRevenueController } from './update-revenue/update-revenue.controller'

export async function revenueRoutes(app: FastifyInstance) {
  app.post('/revenue.add', authorize('AdminPanel', 'Financial', 'Revenues'), createRevenueController)
  app.put('/revenue.update', authorize('AdminPanel', 'Financial', 'Revenues'), updateRevenueController)
  app.get('/revenue.list', authorize('AdminPanel', 'Financial', 'Revenues'), listRevenuesController)
  app.get('/revenue.key/:id', authorize('AdminPanel', 'Financial', 'Revenues'), getRevenueByIdController)
  app.delete('/revenue.delete/:id', authorize('AdminPanel', 'Financial', 'Revenues'), removeRevenueController)
  app.post('/revenue.cancel', authorize('AdminPanel', 'Financial', 'Revenues'), cancelRevenuesController)
  app.post('/revenue.confirmRevenue', authorize('AdminPanel', 'Financial', 'Revenues'), confirmRevenuesController)
}
