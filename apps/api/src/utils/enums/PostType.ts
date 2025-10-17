export const PostType = {
  ADOPTION: 'adocao',
  CAMPAIGN: 'campanha',
  ANNOUNCEMENT: 'comunicado',
} as const

export type PostTypeValue = (typeof PostType)[keyof typeof PostType]

export const PostTypeValues = Object.values(PostType) as [string, ...string[]]
