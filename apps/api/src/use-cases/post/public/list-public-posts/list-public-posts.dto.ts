import type { publicListPostsSchema } from '@/http/controllers/post/public-list-posts/public-list-posts.schema'
import type { z } from 'zod'

export type ListPublicPostsData = z.infer<typeof publicListPostsSchema>
