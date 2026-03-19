export interface UpdateRescueData {
  id: number
  employeeId: number
  rescueDate: string
  locationFound: string
  circumstances: string
  foundConditions: string
  immediateProcedures?: string | null
  observations?: string | null
}
