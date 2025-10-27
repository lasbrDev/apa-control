import type { listVeterinaryClinicsSchema } from '@/http/controllers/veterinary-clinic/list-veterinary-clinics/list-veterinary-clinics.schema'
import type z from 'zod'

export type ListVeterinaryClinicsData = z.infer<typeof listVeterinaryClinicsSchema>

export type ListVeterinaryClinicsDTO = {
  id: number
  name: string
  cnpj: string
  phone: string
  responsible: string
  active: boolean
}
