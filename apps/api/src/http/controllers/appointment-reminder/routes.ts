import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { getAppointmentRemindersUnreadController } from './get-appointment-reminders-unread/get-appointment-reminders-unread.controller'
import { listAppointmentRemindersController } from './list-appointment-reminders/list-appointment-reminders.controller'
import { readAppointmentRemindersController } from './read-appointment-reminders/read-appointment-reminders.controller'

export async function appointmentReminderRoutes(app: FastifyInstance) {
  app.get('/reminder.list', authorize('AdminPanel', 'Appointments'), listAppointmentRemindersController)
  app.get('/reminder.unread', authorize('AdminPanel', 'Appointments'), getAppointmentRemindersUnreadController)
  app.post('/reminder.read', authorize('AdminPanel', 'Appointments'), readAppointmentRemindersController)
}
