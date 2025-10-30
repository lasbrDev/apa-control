import type { DashboardRepository } from '@/repositories'
import type { DashboardResponse, GetDashboardStatsData } from './get-dashboard-stats.dto'

export class GetDashboardStatsUseCase {
  constructor(private dashboardRepository: DashboardRepository) {}

  async execute(data: GetDashboardStatsData): Promise<DashboardResponse> {
    const [stats, monthlyStats, financialStats] = await Promise.all([
      this.dashboardRepository.getStats(),
      this.dashboardRepository.getMonthlyStats(data.year),
      this.dashboardRepository.getFinancialStats(data.year),
    ])

    return {
      stats,
      monthlyStats,
      financialStats,
    }
  }
}
