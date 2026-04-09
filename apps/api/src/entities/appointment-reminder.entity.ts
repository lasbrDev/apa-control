export class AppointmentReminder {
  id?: number
  appointmentId?: number | null
  employeeId: number
  title: string
  message: string
  readAt?: Date | null
  createdAt: Date

  constructor(props: Omit<AppointmentReminder, 'id'>, id?: number) {
    this.id = id
    this.appointmentId = props.appointmentId ?? null
    this.employeeId = props.employeeId
    this.title = props.title
    this.message = props.message
    this.readAt = props.readAt ?? null
    this.createdAt = props.createdAt
  }
}
