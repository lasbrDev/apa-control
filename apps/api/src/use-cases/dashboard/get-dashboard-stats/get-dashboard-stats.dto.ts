import type { getDashboardStatsSchema } from '@/http/controllers/dashboard/get-dashboard-stats/get-dashboard-stats.schema'
import type z from 'zod'

export type GetDashboardStatsData = z.infer<typeof getDashboardStatsSchema>

export interface DashboardStats {
  animals: number
  adoptions: number
  rescues: number
  employees: number
  veterinaryClinics: number
  adopters: number
}

export interface MonthlyStats {
  month: string
  animals: number
  adoptions: number
  rescues: number
}

export interface FinancialStats {
  totalIncome: number
  totalExpense: number
  balance: number
  monthlyData: MonthlyFinancialData[]
}

export interface MonthlyFinancialData {
  month: string
  income: number
  expense: number
}

export interface DashboardResponse {
  stats: DashboardStats
  monthlyStats: MonthlyStats[]
  financialStats: FinancialStats
}
