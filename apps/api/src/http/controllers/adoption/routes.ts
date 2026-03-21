import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { cancelAdoptionController } from './cancel-adoption/cancel-adoption.controller'
import { confirmAdoptionController } from './confirm-adoption/confirm-adoption.controller'
import { createAdoptionController } from './create-adoption/create-adoption.controller'
import { getAdoptionByIdController } from './get-adoption-by-id/get-adoption-by-id.controller'
import { listAdoptionsController } from './list-adoptions/list-adoptions.controller'
import { removeAdoptionController } from './remove-adoption/remove-adoption.controller'
import { updateAdoptionController } from './update-adoption/update-adoption.controller'

export async function adoptionRoutes(app: FastifyInstance) {
  app.post('/adoption.add', authorize('AdminPanel', 'Adoptions'), createAdoptionController)
  app.put('/adoption.update', authorize('AdminPanel', 'Adoptions'), updateAdoptionController)
  app.put('/adoption.confirm', authorize('AdminPanel', 'Adoptions'), confirmAdoptionController)
  app.put('/adoption.cancel', authorize('AdminPanel', 'Adoptions'), cancelAdoptionController)
  app.get('/adoption.list', authorize('AdminPanel', 'Adoptions'), listAdoptionsController)
  app.get('/adoption.key/:id', authorize('AdminPanel', 'Adoptions'), getAdoptionByIdController)
  app.delete('/adoption.delete/:id', authorize('AdminPanel', 'Adoptions'), removeAdoptionController)
}
