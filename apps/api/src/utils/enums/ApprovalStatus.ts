export const ApprovalStatus = {
  PENDING: 'pendente',
  APPROVED: 'aprovado',
  REJECTED: 'reprovado',
} as const

export type ApprovalStatusValue = (typeof ApprovalStatus)[keyof typeof ApprovalStatus]

export const ApprovalStatusValues = Object.values(ApprovalStatus) as [string, ...string[]]
