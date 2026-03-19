import type { CreateAnimalData } from '@/use-cases/animal/create-animal/create-animal.dto'

type CreateAnimalPartData = Omit<CreateAnimalData, 'employeeId'>

export interface CreateRescueData {
  employeeId: number
  animalId?: number
  animal?: CreateAnimalPartData
  rescueDate: string
  locationFound: string
  circumstances: string
  foundConditions: string
  immediateProcedures?: string | null
  observations?: string | null
}
