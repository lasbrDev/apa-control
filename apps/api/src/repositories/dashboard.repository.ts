import { db } from '@/database/client'
import {
  adopter,
  adoption,
  animal,
  employee,
  financialTransaction,
  rescue,
  transactionType,
  veterinaryClinic,
} from '@/database/schema'
import type {
  DashboardStats,
  FinancialStats,
  MonthlyFinancialData,
  MonthlyStats,
} from '@/use-cases/dashboard/get-dashboard-stats/get-dashboard-stats.dto'
import { count, eq, sql, sum } from 'drizzle-orm'

export class DashboardRepository {
  async getStats(): Promise<DashboardStats> {
    const [animalsCount, adoptionsCount, rescuesCount, employeesCount, veterinaryClinicsCount, adoptersCount] =
      await Promise.all([
        db.$count(animal),
        db.$count(adoption),
        db.$count(rescue),
        db.$count(employee),
        db.$count(veterinaryClinic),
        db.$count(adopter),
      ])

    return {
      animals: animalsCount,
      adoptions: adoptionsCount,
      rescues: rescuesCount,
      employees: employeesCount,
      veterinaryClinics: veterinaryClinicsCount,
      adopters: adoptersCount,
    }
  }

  async getMonthlyStats(year: number): Promise<MonthlyStats[]> {
    const months = [
      { number: 1, name: 'Jan' },
      { number: 2, name: 'Fev' },
      { number: 3, name: 'Mar' },
      { number: 4, name: 'Abr' },
      { number: 5, name: 'Mai' },
      { number: 6, name: 'Jun' },
      { number: 7, name: 'Jul' },
      { number: 8, name: 'Ago' },
      { number: 9, name: 'Set' },
      { number: 10, name: 'Out' },
      { number: 11, name: 'Nov' },
      { number: 12, name: 'Dez' },
    ]

    const monthlyStats: MonthlyStats[] = []

    for (const month of months) {
      const [animalsResult, adoptionsResult, rescuesResult] = await Promise.all([
        db
          .select({ count: count() })
          .from(animal)
          .where(
            sql`EXTRACT(YEAR FROM ${animal.createdAt}) = ${year} AND EXTRACT(MONTH FROM ${animal.createdAt}) = ${month.number}`,
          ),
        db
          .select({ count: count() })
          .from(adoption)
          .where(
            sql`EXTRACT(YEAR FROM ${adoption.createdAt}) = ${year} AND EXTRACT(MONTH FROM ${adoption.createdAt}) = ${month.number}`,
          ),
        db
          .select({ count: count() })
          .from(rescue)
          .where(
            sql`EXTRACT(YEAR FROM ${rescue.createdAt}) = ${year} AND EXTRACT(MONTH FROM ${rescue.createdAt}) = ${month.number}`,
          ),
      ])

      monthlyStats.push({
        month: month.name,
        animals: animalsResult[0]?.count || 0,
        adoptions: adoptionsResult[0]?.count || 0,
        rescues: rescuesResult[0]?.count || 0,
      })
    }

    return monthlyStats
  }

  async getFinancialStats(year: number): Promise<FinancialStats> {
    const months = [
      { number: 1, name: 'Jan' },
      { number: 2, name: 'Fev' },
      { number: 3, name: 'Mar' },
      { number: 4, name: 'Abr' },
      { number: 5, name: 'Mai' },
      { number: 6, name: 'Jun' },
      { number: 7, name: 'Jul' },
      { number: 8, name: 'Ago' },
      { number: 9, name: 'Set' },
      { number: 10, name: 'Out' },
      { number: 11, name: 'Nov' },
      { number: 12, name: 'Dez' },
    ]

    const [incomeResult, expenseResult] = await Promise.all([
      db
        .select({ total: sum(financialTransaction.value) })
        .from(financialTransaction)
        .innerJoin(transactionType, eq(financialTransaction.transactionTypeId, transactionType.id))
        .where(
          sql`${transactionType.category} = 'receita' AND ${financialTransaction.status} = 'confirmado' AND EXTRACT(YEAR FROM ${financialTransaction.createdAt}) = ${year}`,
        ),
      db
        .select({ total: sum(financialTransaction.value) })
        .from(financialTransaction)
        .innerJoin(transactionType, eq(financialTransaction.transactionTypeId, transactionType.id))
        .where(
          sql`${transactionType.category} = 'despesa' AND ${financialTransaction.status} = 'confirmado' AND EXTRACT(YEAR FROM ${financialTransaction.createdAt}) = ${year}`,
        ),
    ])

    const totalIncome = Number(incomeResult[0]?.total || 0)
    const totalExpense = Number(expenseResult[0]?.total || 0)
    const balance = totalIncome - totalExpense

    const monthlyData: MonthlyFinancialData[] = []

    for (const month of months) {
      const [monthIncomeResult, monthExpenseResult] = await Promise.all([
        db
          .select({ total: sum(financialTransaction.value) })
          .from(financialTransaction)
          .innerJoin(transactionType, eq(financialTransaction.transactionTypeId, transactionType.id))
          .where(
            sql`${transactionType.category} = 'receita' AND ${financialTransaction.status} = 'confirmado' AND EXTRACT(YEAR FROM ${financialTransaction.createdAt}) = ${year} AND EXTRACT(MONTH FROM ${financialTransaction.createdAt}) = ${month.number}`,
          ),
        db
          .select({ total: sum(financialTransaction.value) })
          .from(financialTransaction)
          .innerJoin(transactionType, eq(financialTransaction.transactionTypeId, transactionType.id))
          .where(
            sql`${transactionType.category} = 'despesa' AND ${financialTransaction.status} = 'confirmado' AND EXTRACT(YEAR FROM ${financialTransaction.createdAt}) = ${year} AND EXTRACT(MONTH FROM ${financialTransaction.createdAt}) = ${month.number}`,
          ),
      ])

      monthlyData.push({
        month: month.name,
        income: Number(monthIncomeResult[0]?.total || 0),
        expense: Number(monthExpenseResult[0]?.total || 0),
      })
    }

    return {
      totalIncome,
      totalExpense,
      balance,
      monthlyData,
    }
  }
}
