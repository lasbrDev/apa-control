import type { getAdopterByIdSchema } from '@/http/controllers/adopter/get-adopter-by-id/get-adopter-by-id.schema'
import type z from 'zod'

export type GetAdopterByIdData = z.infer<typeof getAdopterByIdSchema>

export interface GetAdopterByIdDTO {
  id: number
  name: string
  cpf: string
  email: string
  phone: string
  address: string
  familyIncome: number
  animalExperience: boolean
  approvalStatus: string
}
