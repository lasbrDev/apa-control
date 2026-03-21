import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { createOccurrenceController } from './create-occurrence/create-occurrence.controller'
import { getOccurrenceByIdController } from './get-occurrence-by-id/get-occurrence-by-id.controller'
import { listOccurrencesController } from './list-occurrences/list-occurrences.controller'
import { removeOccurrenceController } from './remove-occurrence/remove-occurrence.controller'
import { updateOccurrenceController } from './update-occurrence/update-occurrence.controller'

export async function occurrenceRoutes(app: FastifyInstance) {
  app.post('/occurrence.add', authorize('AdminPanel', 'Animals'), createOccurrenceController)
  app.put('/occurrence.update', authorize('AdminPanel', 'Animals'), updateOccurrenceController)
  app.get('/occurrence.list', authorize('AdminPanel', 'Animals'), listOccurrencesController)
  app.get('/occurrence.key/:id', authorize('AdminPanel', 'Animals'), getOccurrenceByIdController)
  app.delete('/occurrence.delete/:id', authorize('AdminPanel', 'Animals'), removeOccurrenceController)
}
