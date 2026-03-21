import type { createPostSchema } from '@/http/controllers/post/create-post/create-post.schema'
import type { z } from 'zod'

export type CreatePostData = z.infer<typeof createPostSchema>
