export interface GetFinalDestinationByIdData {
  id: number
}

export interface FinalDestinationById {
  id: number
  animalId: number
  destinationTypeId: number
  employeeId: number
  destinationDate: string
  reason: string
  observations: string | null
  proof: string | null
  createdAt: Date
  animalName: string | null
  destinationTypeName: string | null
  employeeName: string | null
}
