import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'

import { getAnimalHistoryByIdController } from './get-animal-history-by-id/get-animal-history-by-id.controller'

export async function animalHistoryRoutes(app: FastifyInstance) {
  app.get('/animal-history.key/:id', authorize('AdminPanel', 'Animals', 'Rescues'), getAnimalHistoryByIdController)
}
