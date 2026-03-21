import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { createPostController } from './create-post/create-post.controller'
import { getPostByIdController } from './get-post-by-id/get-post-by-id.controller'
import { listPostsController } from './list-posts/list-posts.controller'
import { publicGetPostController } from './public-get-post/public-get-post.controller'
import { publicListPostsController } from './public-list-posts/public-list-posts.controller'
import { removePostController } from './remove-post/remove-post.controller'
import { updatePostController } from './update-post/update-post.controller'

export async function postRoutes(app: FastifyInstance) {
  // Admin CRUD (gerenciamento)
  app.post('/post.add', authorize('AdminPanel', 'Posts'), createPostController)
  app.put('/post.update', authorize('AdminPanel', 'Posts'), updatePostController)
  app.get('/post.list', authorize('AdminPanel', 'Posts'), listPostsController)
  app.get('/post.key/:id', authorize('AdminPanel', 'Posts'), getPostByIdController)
  app.delete('/post.delete/:id', authorize('AdminPanel', 'Posts'), removePostController)

  // Public endpoints (página pública)
  app.get('/post.public.list', publicListPostsController)
  app.get('/post.public.key/:id', publicGetPostController)
}
