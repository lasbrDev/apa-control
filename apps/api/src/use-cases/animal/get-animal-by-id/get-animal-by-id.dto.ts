export interface GetAnimalByIdData {
  id: number
}

export type GetAnimalByIdDTO = {
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
