import { db } from '@/database/client'
import { animal, campaign, employee, financialTransaction, transactionType } from '@/database/schema'
import { TransactionCategory } from '@/database/schema/enums/transaction-category'
import type { DrizzleTransaction } from '@/database/types'
import type { FinancialTransaction } from '@/entities'
import type { ExpenseWithDetails, ListExpensesData } from '@/use-cases/expense/list-expenses/list-expenses.dto'
import type { ListRevenuesData, RevenueWithDetails } from '@/use-cases/revenue/list-revenues/list-revenues.dto'
import { ApiError } from '@/utils/api-error'
import { type QueryStringSettings, querifyString } from '@/utils/drizzle/querify-string'
import { type SQL, and, eq, ilike, inArray, sql } from 'drizzle-orm'

const transactionListQuerifySettings: QueryStringSettings = {
  table: financialTransaction,
  initialOrderBy: financialTransaction.createdAt,
  includes: [
    [transactionType, eq(transactionType.id, financialTransaction.transactionTypeId), { innerJoin: true }],
    [campaign, eq(campaign.id, financialTransaction.campaignId)],
    [animal, eq(animal.id, financialTransaction.animalId)],
    [employee, eq(employee.id, financialTransaction.employeeId)],
  ],
  customFields: {
    transactionTypeName: transactionType.name,
    campaignTitle: campaign.title,
    animalName: animal.name,
    employeeName: employee.name,
  },
}

export class FinancialTransactionRepository {
  create(data: FinancialTransaction, dbTransaction: DrizzleTransaction | null) {
    const connection = dbTransaction ?? db
    return connection.insert(financialTransaction).values(data).returning({ id: financialTransaction.id })
  }

  async listExpenses(data: ListExpensesData): Promise<[number, ExpenseWithDetails[]]> {
    return this.listByCategory(data, TransactionCategory.EXPENSE)
  }

  async listRevenues(data: ListRevenuesData): Promise<[number, RevenueWithDetails[]]> {
    return this.listByCategory(data, TransactionCategory.INCOME)
  }

  private async listByCategory(
    data: ListExpensesData,
    category: (typeof TransactionCategory)[keyof typeof TransactionCategory],
  ): Promise<[number, ExpenseWithDetails[]]> {
    const {
      description,
      animalName,
      transactionTypeId,
      campaignId,
      animalId,
      employeeId,
      status,
      createdAtStart,
      createdAtEnd,
    } = data
    const whereList: SQL[] = [eq(transactionType.category, category)]

    if (description) whereList.push(ilike(financialTransaction.description, `%${description}%`))
    if (animalName) whereList.push(ilike(animal.name, `%${animalName}%`))
    if (transactionTypeId) whereList.push(eq(financialTransaction.transactionTypeId, transactionTypeId))
    if (campaignId) whereList.push(eq(financialTransaction.campaignId, campaignId))
    if (animalId) whereList.push(eq(financialTransaction.animalId, animalId))
    if (employeeId) whereList.push(eq(financialTransaction.employeeId, employeeId))
    if (status === 'vencido') {
      whereList.push(eq(financialTransaction.status, 'pendente'))
      whereList.push(sql`${financialTransaction.dueDate} IS NOT NULL`)
      whereList.push(sql`${financialTransaction.dueDate} < CURRENT_DATE`)
    } else if (status) {
      whereList.push(eq(financialTransaction.status, status))
    }
    if (createdAtStart) whereList.push(sql`${financialTransaction.createdAt}::date >= ${createdAtStart}`)
    if (createdAtEnd) whereList.push(sql`${financialTransaction.createdAt}::date <= ${createdAtEnd}`)

    const [sqlQuery, countQuery] = querifyString<ExpenseWithDetails>(data, whereList, transactionListQuerifySettings)
    const items = await sqlQuery
    const [{ total }] = await countQuery

    return [total, items]
  }

  async findExpenseById(id: number) {
    return this.findByIdAndCategory(id, TransactionCategory.EXPENSE)
  }

  async findRevenueById(id: number) {
    return this.findByIdAndCategory(id, TransactionCategory.INCOME)
  }

  private async findByIdAndCategory(
    id: number,
    category: (typeof TransactionCategory)[keyof typeof TransactionCategory],
  ) {
    const [item] = await db
      .select({
        id: financialTransaction.id,
        transactionTypeId: financialTransaction.transactionTypeId,
        campaignId: financialTransaction.campaignId,
        animalId: financialTransaction.animalId,
        employeeId: financialTransaction.employeeId,
        description: financialTransaction.description,
        value: financialTransaction.value,
        proof: financialTransaction.proof,
        observations: financialTransaction.observations,
        status: financialTransaction.status,
        dueDate: financialTransaction.dueDate,
        paymentDate: financialTransaction.paymentDate,
        reversalDate: financialTransaction.reversalDate,
        createdAt: financialTransaction.createdAt,
        transactionTypeName: transactionType.name,
        campaignTitle: campaign.title,
        animalName: animal.name,
        employeeName: employee.name,
      })
      .from(financialTransaction)
      .innerJoin(transactionType, eq(transactionType.id, financialTransaction.transactionTypeId))
      .leftJoin(campaign, eq(campaign.id, financialTransaction.campaignId))
      .leftJoin(animal, eq(animal.id, financialTransaction.animalId))
      .leftJoin(employee, eq(employee.id, financialTransaction.employeeId))
      .where(and(eq(financialTransaction.id, id), eq(transactionType.category, category)))

    if (!item) return null
    return item
  }

  async findExpenseByIdOrThrow(id: number) {
    const item = await this.findExpenseById(id)
    if (!item) throw new ApiError('Despesa não encontrada.', 404)
    return item
  }

  async findRevenueByIdOrThrow(id: number) {
    const item = await this.findRevenueById(id)
    if (!item) throw new ApiError('Receita não encontrada.', 404)
    return item
  }

  async update(
    id: number,
    data: Partial<Omit<FinancialTransaction, 'id'>>,
    dbTransaction: DrizzleTransaction | null = null,
  ) {
    const connection = dbTransaction ?? db
    await connection.update(financialTransaction).set(data).where(eq(financialTransaction.id, id))
  }

  async delete(id: number, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.delete(financialTransaction).where(eq(financialTransaction.id, id))
  }

  async findByIds(ids: number[]) {
    return db
      .select({
        id: financialTransaction.id,
        animalId: financialTransaction.animalId,
        description: financialTransaction.description,
        employeeId: financialTransaction.employeeId,
      })
      .from(financialTransaction)
      .where(inArray(financialTransaction.id, ids))
  }

  async cancelByIds(ids: number[]) {
    await db
      .update(financialTransaction)
      .set({ status: 'estornado', paymentDate: null, reversalDate: sql`now()` })
      .where(inArray(financialTransaction.id, ids))
  }

  async reverseById(id: number) {
    await db
      .update(financialTransaction)
      .set({ status: 'estornado', paymentDate: null, reversalDate: sql`now()` })
      .where(eq(financialTransaction.id, id))
  }

  async confirmTransactionByIds(ids: number[]) {
    await db
      .update(financialTransaction)
      .set({ status: 'confirmado', paymentDate: sql`now()`, reversalDate: null })
      .where(inArray(financialTransaction.id, ids))
  }
}
