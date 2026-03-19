export interface ListFinalDestinationsData {
  animalName?: string
  destinationTypeId?: number
  employeeId?: number
  destinationDateStart?: string
  destinationDateEnd?: string
  page?: number
  perPage?: number
  sort?: Array<{ name: string; order: string }>
  fields?: string[]
}

export type FinalDestinationWithDetails = {
  id: number
  animalId: number
  destinationTypeId: number
  employeeId: number
  destinationDate: string
  reason: string
  observations: string | null
  proof: string | null
  createdAt: Date
  animalName?: string
  destinationTypeName?: string
  employeeName?: string
}
