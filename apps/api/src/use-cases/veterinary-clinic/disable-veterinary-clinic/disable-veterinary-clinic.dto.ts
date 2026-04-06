import type { disableVeterinaryClinicSchema } from '@/http/controllers/veterinary-clinic/disable-veterinary-clinic/disable-veterinary-clinic.schema'
import type z from 'zod'

export type DisableVeterinaryClinicData = z.infer<typeof disableVeterinaryClinicSchema>
