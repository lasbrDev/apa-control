export interface ListRescuesData {
  locationFound?: string
  animalName?: string
  animalId?: number
  rescueDateStart?: string
  rescueDateEnd?: string
  page?: number
  perPage?: number
  sort?: Array<{ name: string; order: string }>
  fields?: string[]
}

export type RescueWithDetails = {
  id: number
  animalId: number
  employeeId: number
  rescueDate: Date
  locationFound: string
  circumstances: string
  foundConditions: string
  immediateProcedures: string | null
  observations: string | null
  createdAt: Date
  animalName?: string
}
