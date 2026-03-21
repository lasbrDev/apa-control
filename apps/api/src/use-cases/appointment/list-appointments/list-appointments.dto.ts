export interface ListAppointmentsData {
  animalName?: string
  appointmentTypeId?: number
  clinicId?: number
  consultationType?: string
  status?: string
  employeeId?: number
  appointmentDateStart?: string
  appointmentDateEnd?: string
  page?: number
  perPage?: number
  sort?: Array<{ name: string; order: string }>
  fields?: string[]
}

export interface AppointmentWithDetails {
  id: number
  animalId: number
  appointmentTypeId: number
  clinicId: number | null
  employeeId: number
  appointmentDate: Date
  consultationType: string
  status: string
  observations: string | null
  createdAt: Date
  updatedAt: Date | null
  animalName?: string | null
  appointmentTypeName?: string | null
  clinicName?: string | null
  employeeName?: string | null
}
