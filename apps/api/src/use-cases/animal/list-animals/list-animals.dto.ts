export interface ListAnimalsData {
  name?: string
  species?: string
  breed?: string
  status?: string
  show?: 'all' | 'disabled' | 'enabled'
  page?: number
  perPage?: number
  sort?: Array<{ name: string; order: string }>
  fields?: string[]
}

export type AnimalWithDetails = {
  id: number
  name: string
  species: string
  breed: string | null
  size: string
  sex: string
  birthYear: number | null
  healthCondition: string
  entryDate: string
  observations: string | null
  status: string
  createdAt: Date
  updatedAt: Date | null
}
