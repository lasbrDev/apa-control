import { z } from 'zod'

export const removeVeterinaryClinicSchema = z.object({ id: z.coerce.number() })
