export interface ListAppointmentRemindersData {
  employeeId: number
  page?: number
  perPage?: number
  readStatus?: 'all' | 'read' | 'unread'
}

export interface AppointmentReminderWithDetails {
  id: number
  appointmentId: number | null
  employeeId: number
  title: string
  message: string
  readAt: Date | null
  createdAt: Date
  animalName: string | null
  appointmentDate: Date | null
}
