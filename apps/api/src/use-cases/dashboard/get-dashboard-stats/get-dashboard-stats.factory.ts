import { DashboardRepository } from '@/repositories/dashboard.repository'
import { GetDashboardStatsUseCase } from './get-dashboard-stats'

export function makeGetDashboardStatsUseCase() {
  const dashboardRepository = new DashboardRepository()
  const getDashboardStatsUseCase = new GetDashboardStatsUseCase(dashboardRepository)

  return getDashboardStatsUseCase
}
