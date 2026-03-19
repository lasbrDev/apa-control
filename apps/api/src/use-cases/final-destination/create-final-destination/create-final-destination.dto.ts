export interface CreateFinalDestinationData {
  animalId: number
  destinationTypeId: number
  destinationDate: string
  reason: string
  observations?: string | null
  proof?: string | null
  employeeId: number
}
