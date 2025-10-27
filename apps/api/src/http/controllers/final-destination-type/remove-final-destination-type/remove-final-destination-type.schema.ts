import { z } from 'zod'

export const removeFinalDestinationTypeSchema = z.object({ id: z.coerce.number() })
