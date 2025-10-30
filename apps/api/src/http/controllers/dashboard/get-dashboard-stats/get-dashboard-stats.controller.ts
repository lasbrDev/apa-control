import { makeGetDashboardStatsUseCase } from '@/use-cases/dashboard/get-dashboard-stats/get-dashboard-stats.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getDashboardStatsSchema } from './get-dashboard-stats.schema'

export async function getDashboardStatsController(request: FastifyRequest, reply: FastifyReply) {
  const data = getDashboardStatsSchema.parse(request.query)
  const getDashboardStatsUseCase = makeGetDashboardStatsUseCase()
  const result = await getDashboardStatsUseCase.execute(data)

  return result
}
