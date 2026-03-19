import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { createRescueController } from './create-rescue/create-rescue.controller'
import { getRescueByIdController } from './get-rescue-by-id/get-rescue-by-id.controller'
import { listRescuesController } from './list-rescues/list-rescues.controller'
import { removeRescueController } from './remove-rescue/remove-rescue.controller'
import { updateRescueController } from './update-rescue/update-rescue.controller'

export async function rescueRoutes(app: FastifyInstance) {
  app.post('/rescue.add', authorize('AdminPanel', 'Rescues'), createRescueController)
  app.put('/rescue.update', authorize('AdminPanel', 'Rescues'), updateRescueController)
  app.get('/rescue.list', authorize('AdminPanel', 'Rescues'), listRescuesController)
  app.get('/rescue.key/:id', authorize('AdminPanel', 'Rescues'), getRescueByIdController)
  app.delete('/rescue.delete/:id', authorize('AdminPanel', 'Rescues'), removeRescueController)
}
