export interface ListAdoptionsData {
  animalName?: string
  adopterName?: string
  status?: string
  employeeId?: number
  adoptionDateStart?: string
  adoptionDateEnd?: string
  page?: number
  perPage?: number
  sort?: Array<{ name: string; order: string }>
  fields?: string[]
}

export type AdoptionWithDetails = {
  id: number
  animalId: number
  adopterId: number
  employeeId: number
  adoptionDate: string
  adaptationPeriod: number | null
  status: string
  observations: string | null
  proof: string | null
  createdAt: Date
  updatedAt: Date | null
  animalName?: string | null
  adopterName?: string | null
  employeeName?: string | null
}
