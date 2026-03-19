import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { createFinalDestinationController } from './create-final-destination/create-final-destination.controller'
import { getFinalDestinationByIdController } from './get-final-destination-by-id/get-final-destination-by-id.controller'
import { listFinalDestinationsController } from './list-final-destinations/list-final-destinations.controller'
import { removeFinalDestinationController } from './remove-final-destination/remove-final-destination.controller'
import { updateFinalDestinationController } from './update-final-destination/update-final-destination.controller'

export async function finalDestinationRoutes(app: FastifyInstance) {
  app.post('/final-destination.add', authorize('AdminPanel', 'FinalDestinations'), createFinalDestinationController)
  app.put('/final-destination.update', authorize('AdminPanel', 'FinalDestinations'), updateFinalDestinationController)
  app.get('/final-destination.list', authorize('AdminPanel', 'FinalDestinations'), listFinalDestinationsController)
  app.get('/final-destination.key/:id', authorize('AdminPanel', 'FinalDestinations'), getFinalDestinationByIdController)
  app.delete(
    '/final-destination.delete/:id',
    authorize('AdminPanel', 'FinalDestinations'),
    removeFinalDestinationController,
  )
}
