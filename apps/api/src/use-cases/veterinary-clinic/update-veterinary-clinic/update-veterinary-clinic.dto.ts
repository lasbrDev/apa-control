import type { updateVeterinaryClinicSchema } from '@/http/controllers/veterinary-clinic/update-veterinary-clinic/update-veterinary-clinic.schema'
import type z from 'zod'

export type UpdateVeterinaryClinicData = z.infer<typeof updateVeterinaryClinicSchema>
