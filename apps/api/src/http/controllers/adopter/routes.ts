import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { createAdopterController } from './create-adopter/create-adopter.controller'
import { getAdopterByIdController } from './get-adopter-by-id/get-adopter-by-id.controller'
import { listAdoptersController } from './list-adopters/list-adopters.controller'
import { removeAdopterController } from './remove-adopter/remove-adopter.controller'
import { updateAdopterController } from './update-adopter/update-adopter.controller'

export async function adopterRoutes(app: FastifyInstance) {
  app.post('/adopter.add', authorize('AdminPanel', 'Adopters'), createAdopterController)
  app.put('/adopter.update', authorize('AdminPanel', 'Adopters'), updateAdopterController)
  app.get('/adopter.list', authorize('AdminPanel', 'Adopters'), listAdoptersController)
  app.get('/adopter.key/:id', authorize('AdminPanel', 'Adopters'), getAdopterByIdController)
  app.delete('/adopter.delete/:id', authorize('AdminPanel', 'Adopters'), removeAdopterController)
}
