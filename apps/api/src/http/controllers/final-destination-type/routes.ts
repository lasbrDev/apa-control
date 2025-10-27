import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { createFinalDestinationTypeController } from './create-final-destination-type/create-final-destination-type.controller'
import { getFinalDestinationTypeByIdController } from './get-final-destination-type-by-id/get-final-destination-type-by-id.controller'
import { listFinalDestinationTypesController } from './list-final-destination-types/list-final-destination-types.controller'
import { removeFinalDestinationTypeController } from './remove-final-destination-type/remove-final-destination-type.controller'
import { updateFinalDestinationTypeController } from './update-final-destination-type/update-final-destination-type.controller'

export async function finalDestinationTypeRoutes(app: FastifyInstance) {
  app.post(
    '/final-destination-type.add',
    authorize('AdminPanel', 'FinalDestinationTypes'),
    createFinalDestinationTypeController,
  )
  app.put(
    '/final-destination-type.update',
    authorize('AdminPanel', 'FinalDestinationTypes'),
    updateFinalDestinationTypeController,
  )
  app.get(
    '/final-destination-type.list',
    authorize('AdminPanel', 'FinalDestinationTypes'),
    listFinalDestinationTypesController,
  )
  app.get(
    '/final-destination-type.key/:id',
    authorize('AdminPanel', 'FinalDestinationTypes'),
    getFinalDestinationTypeByIdController,
  )
  app.delete(
    '/final-destination-type.delete/:id',
    authorize('AdminPanel', 'FinalDestinationTypes'),
    removeFinalDestinationTypeController,
  )
}
