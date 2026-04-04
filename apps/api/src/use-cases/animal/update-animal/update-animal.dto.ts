export interface UpdateAnimalData {
  id: number
  employeeId: number
  name: string
  species: string
  breed?: string | null
  size: string
  sex: string
  birthYear?: number | null
  healthCondition: string
  entryDate: string
  observations?: string | null
  status: string
}
