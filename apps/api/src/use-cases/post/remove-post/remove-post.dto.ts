import type { removePostSchema } from '@/http/controllers/post/remove-post/remove-post.schema'
import type { z } from 'zod'

export type RemovePostData = z.infer<typeof removePostSchema>
