export const PostStatus = {
  DRAFT: 'rascunho',
  PUBLISHED: 'publicado',
  ARCHIVED: 'arquivado',
} as const

export type PostStatusValue = (typeof PostStatus)[keyof typeof PostStatus]

export const PostStatusValues = Object.values(PostStatus) as [string, ...string[]]
