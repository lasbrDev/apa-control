import type { listAdoptersSchema } from '@/http/controllers/adopter/list-adopters/list-adopters.schema'
import type z from 'zod'

export type ListAdoptersData = z.infer<typeof listAdoptersSchema>

export type ListAdoptersDTO = {
  id: number
  name: string
  cpf: string
  email: string
  phone: string
  approvalStatus: string
}
