import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { createAnamnesisController } from './create-anamnesis/create-anamnesis.controller'
import { getAnamnesisByIdController } from './get-anamnesis-by-id/get-anamnesis-by-id.controller'
import { listAnamnesesController } from './list-anamneses/list-anamneses.controller'
import { removeAnamnesisController } from './remove-anamnesis/remove-anamnesis.controller'
import { updateAnamnesisController } from './update-anamnesis/update-anamnesis.controller'

export async function anamnesisRoutes(app: FastifyInstance) {
  app.post('/anamnesis.add', authorize('AdminPanel', 'Anamnesis'), createAnamnesisController)
  app.put('/anamnesis.update', authorize('AdminPanel', 'Anamnesis'), updateAnamnesisController)
  app.get('/anamnesis.list', authorize('AdminPanel', 'Anamnesis'), listAnamnesesController)
  app.get('/anamnesis.key/:id', authorize('AdminPanel', 'Anamnesis'), getAnamnesisByIdController)
  app.delete('/anamnesis.delete/:id', authorize('AdminPanel', 'Anamnesis'), removeAnamnesisController)
}
