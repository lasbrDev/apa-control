export const TransactionStatus = {
  PENDING: 'pendente',
  CONFIRMED: 'confirmado',
  CANCELLED: 'estornado',
} as const

export type TransactionStatusValue = (typeof TransactionStatus)[keyof typeof TransactionStatus]

export const TransactionStatusValues = Object.values(TransactionStatus) as [string, ...string[]]
