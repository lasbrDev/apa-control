import { z } from 'zod'

export const getFinalDestinationTypeByIdSchema = z.object({
  id: z.coerce.number(),
})
