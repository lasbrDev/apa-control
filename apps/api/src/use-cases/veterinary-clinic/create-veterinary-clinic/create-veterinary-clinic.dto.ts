import type { createVeterinaryClinicSchema } from '@/http/controllers/veterinary-clinic/create-veterinary-clinic/create-veterinary-clinic.schema'
import type z from 'zod'

export type CreateVeterinaryClinicData = z.infer<typeof createVeterinaryClinicSchema>

export interface CreateVeterinaryClinicDTO {
  id: number
}
