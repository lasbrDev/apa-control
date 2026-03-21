import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { createOccurrenceTypeController } from './create-occurrence-type/create-occurrence-type.controller'
import { getOccurrenceTypeByIdController } from './get-occurrence-type-by-id/get-occurrence-type-by-id.controller'
import { listOccurrenceTypesController } from './list-occurrence-types/list-occurrence-types.controller'
import { removeOccurrenceTypeController } from './remove-occurrence-type/remove-occurrence-type.controller'
import { updateOccurrenceTypeController } from './update-occurrence-type/update-occurrence-type.controller'

export async function occurrenceTypeRoutes(app: FastifyInstance) {
  app.post('/occurrence-type.add', authorize('AdminPanel', 'Registrations'), createOccurrenceTypeController)
  app.put('/occurrence-type.update', authorize('AdminPanel', 'Registrations'), updateOccurrenceTypeController)
  app.get('/occurrence-type.list', authorize('AdminPanel', 'Registrations'), listOccurrenceTypesController)
  app.get('/occurrence-type.key/:id', authorize('AdminPanel', 'Registrations'), getOccurrenceTypeByIdController)
  app.delete('/occurrence-type.delete/:id', authorize('AdminPanel', 'Registrations'), removeOccurrenceTypeController)
}
