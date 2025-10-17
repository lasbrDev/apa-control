export const TransactionCategory = {
  INCOME: 'receita',
  EXPENSE: 'despesa',
} as const

export type TransactionCategoryValue = (typeof TransactionCategory)[keyof typeof TransactionCategory]

export const TransactionCategoryValues = Object.values(TransactionCategory) as [string, ...string[]]
