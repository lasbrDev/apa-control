import type { updatePostSchema } from '@/http/controllers/post/update-post/update-post.schema'
import type { z } from 'zod'

export type UpdatePostData = z.infer<typeof updatePostSchema>
