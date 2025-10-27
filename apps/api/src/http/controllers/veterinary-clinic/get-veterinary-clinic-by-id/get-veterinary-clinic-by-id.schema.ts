import { z } from 'zod'

export const getVeterinaryClinicByIdSchema = z.object({
  id: z.coerce.number(),
})
