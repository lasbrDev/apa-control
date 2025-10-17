import {
  type ColumnBaseConfig,
  type ColumnDataType,
  type SQL,
  and,
  asc,
  count,
  desc,
  getTableColumns,
} from 'drizzle-orm'

import { db } from '../../../drizzle/client'

import type { PgColumn, PgSelectBase, PgTable, SelectedFields } from 'drizzle-orm/pg-core'
import type { ApiStringQuery } from './ApiQuerySchema'

export interface QueryStringSettings {
  table: PgTable
  initialOrderBy: PgColumn
  includes?: Array<[table: PgTable, condition: SQL, options?: { innerJoin?: boolean }]>
  customFields?: Record<string, PgColumn | SQL>
}

export function querifyString<T>(
  data: ApiStringQuery,
  whereList: SQL[],
  { table, initialOrderBy, includes, customFields = {} }: QueryStringSettings,
): [sqlQuery: Promise<T[]>, countQuery: Promise<Array<{ total: number }>>] {
  let sqlQuery: PgSelectBase<
    string,
    SelectedFields,
    'partial',
    Record<string, 'not-null'>,
    false,
    never,
    Array<{ [x: string]: unknown }>,
    { [x: string]: never }
  >

  const { page, sort, fields } = data

  if (fields?.length) {
    sqlQuery = db
      .select(
        fields.reduce((acc, field) => {
          const customValue = customFields[field]

          if (customValue) {
            acc[field] = customValue
          } else if (field in table) {
            acc[field] = table[field as keyof typeof table] as PgColumn
          }

          return acc
        }, {} as SelectedFields),
      )
      .from(table)
  } else {
    const allColumns: Record<string, SQL | PgColumn<ColumnBaseConfig<ColumnDataType, string>>> = getTableColumns(table)

    const columns = Object.entries(allColumns)
      .concat(Object.entries(customFields))
      .reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value }),
        {} as Record<string, SQL | PgColumn<ColumnBaseConfig<ColumnDataType, string>>>,
      )

    sqlQuery = db.select(columns).from(table)
  }

  const countQuery = db.select({ total: count() }).from(table)

  if (includes?.length) {
    for (const [table, condition, options = {}] of includes) {
      if (options.innerJoin) {
        sqlQuery.innerJoin(table, condition)
        countQuery.innerJoin(table, condition)
      } else {
        sqlQuery.leftJoin(table, condition)
        countQuery.leftJoin(table, condition)
      }
    }
  }

  if (sort?.length) {
    const orderings: SQL[] = []

    for (const item of sort) {
      const order = (item.order || 'asc').toLowerCase()
      const customValue = customFields[item.name]
      const fn = order === 'asc' ? asc : desc

      if (customValue) {
        orderings.push(fn(customValue))
      } else if (item.name in table) {
        orderings.push(fn(table[item.name as keyof typeof table] as PgColumn))
      }
    }

    sqlQuery.orderBy(...orderings)
  } else {
    sqlQuery.orderBy(initialOrderBy)
  }

  sqlQuery.where(and(...whereList))
  countQuery.where(and(...whereList))

  if (page) {
    const perPage = data.perPage ?? 10

    sqlQuery.limit(perPage).offset((page - 1) * perPage)
  }

  return [sqlQuery as unknown as Promise<T[]>, countQuery]
}
