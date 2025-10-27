import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { createAppointmentTypeController } from './create-appointment-type/create-appointment-type.controller'
import { getAppointmentTypeByIdController } from './get-appointment-type-by-id/get-appointment-type-by-id.controller'
import { listAppointmentTypesController } from './list-appointment-types/list-appointment-types.controller'
import { removeAppointmentTypeController } from './remove-appointment-type/remove-appointment-type.controller'
import { updateAppointmentTypeController } from './update-appointment-type/update-appointment-type.controller'

export async function appointmentTypeRoutes(app: FastifyInstance) {
  app.post('/appointment-type.add', authorize('AdminPanel', 'AppointmentTypes'), createAppointmentTypeController)
  app.put('/appointment-type.update', authorize('AdminPanel', 'AppointmentTypes'), updateAppointmentTypeController)
  app.get('/appointment-type.list', authorize('AdminPanel', 'AppointmentTypes'), listAppointmentTypesController)
  app.get('/appointment-type.key/:id', authorize('AdminPanel', 'AppointmentTypes'), getAppointmentTypeByIdController)
  app.delete(
    '/appointment-type.delete/:id',
    authorize('AdminPanel', 'AppointmentTypes'),
    removeAppointmentTypeController,
  )
}
