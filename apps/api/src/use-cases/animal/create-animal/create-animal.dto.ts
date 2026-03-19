export interface CreateAnimalData {
  employeeId: number
  name: string
  species: string
  breed?: string | null
  size: string
  sex: string
  age: number
  healthCondition: string
  entryDate: string
  observations?: string | null
  status: string
}
