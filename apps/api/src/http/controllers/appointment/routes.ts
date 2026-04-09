import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { cancelAppointmentsController } from './cancel-appointments/cancel-appointments.controller'
import { confirmAppointmentsController } from './confirm-appointments/confirm-appointments.controller'
import { createAppointmentController } from './create-appointment/create-appointment.controller'
import { getAppointmentByIdController } from './get-appointment-by-id/get-appointment-by-id.controller'
import { listAppointmentsController } from './list-appointments/list-appointments.controller'
import { removeAppointmentController } from './remove-appointment/remove-appointment.controller'
import { updateAppointmentController } from './update-appointment/update-appointment.controller'

export async function appointmentRoutes(app: FastifyInstance) {
  app.post('/appointment.add', authorize('AdminPanel', 'Appointments'), createAppointmentController)
  app.post('/appointment.confirm', authorize('AdminPanel', 'Appointments'), confirmAppointmentsController)
  app.post('/appointment.cancel', authorize('AdminPanel', 'Appointments'), cancelAppointmentsController)
  app.put('/appointment.update', authorize('AdminPanel', 'Appointments'), updateAppointmentController)
  app.get('/appointment.list', authorize('AdminPanel', 'Appointments'), listAppointmentsController)
  app.get('/appointment.key/:id', authorize('AdminPanel', 'Appointments'), getAppointmentByIdController)
  app.delete('/appointment.delete/:id', authorize('AdminPanel', 'Appointments'), removeAppointmentController)
}
