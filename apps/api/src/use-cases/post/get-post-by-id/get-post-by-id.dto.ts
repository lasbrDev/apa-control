import type { getPostByIdSchema } from '@/http/controllers/post/get-post-by-id/get-post-by-id.schema'
import type { z } from 'zod'

export type GetPostByIdData = z.infer<typeof getPostByIdSchema>
