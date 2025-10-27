import { z } from 'zod'

export const removeTransactionTypeSchema = z.object({ id: z.coerce.number() })
