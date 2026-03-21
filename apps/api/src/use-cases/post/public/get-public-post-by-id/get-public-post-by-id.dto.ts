import type { publicGetPostSchema } from '@/http/controllers/post/public-get-post/public-get-post.schema'
import type { z } from 'zod'

export type GetPublicPostByIdData = z.infer<typeof publicGetPostSchema>
