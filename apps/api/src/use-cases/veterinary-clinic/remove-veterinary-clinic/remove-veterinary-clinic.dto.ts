import type { removeVeterinaryClinicSchema } from '@/http/controllers/veterinary-clinic/remove-veterinary-clinic/remove-veterinary-clinic.schema'
import type z from 'zod'

export type RemoveVeterinaryClinicData = z.infer<typeof removeVeterinaryClinicSchema>
