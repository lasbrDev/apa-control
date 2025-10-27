import type { getVeterinaryClinicByIdSchema } from '@/http/controllers/veterinary-clinic/get-veterinary-clinic-by-id/get-veterinary-clinic-by-id.schema'
import type z from 'zod'

export type GetVeterinaryClinicByIdData = z.infer<typeof getVeterinaryClinicByIdSchema>

export interface GetVeterinaryClinicByIdDTO {
  id: number
  name: string
  cnpj: string
  phone: string
  address: string
  responsible: string
  specialties: string | null
  active: boolean
}
