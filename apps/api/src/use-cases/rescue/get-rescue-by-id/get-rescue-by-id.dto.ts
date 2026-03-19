export interface GetRescueByIdData {
  id: number
}

export type GetRescueByIdDTO = {
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
  animalName: string | null
}
