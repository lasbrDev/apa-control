import { z } from 'zod'

export const removeAdopterSchema = z.object({ id: z.coerce.number() })
