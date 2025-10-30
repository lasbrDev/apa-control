import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { getDashboardStatsController } from './get-dashboard-stats/get-dashboard-stats.controller'

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/dashboard.stats', authorize('AdminPanel'), getDashboardStatsController)
}
