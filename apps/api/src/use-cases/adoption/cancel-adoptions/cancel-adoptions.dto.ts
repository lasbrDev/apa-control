import type { cancelAdoptionsSchema } from '@/http/controllers/adoption/cancel-adoptions/cancel-adoptions.schema'
import type { z } from 'zod'

export type CancelAdoptionsData = z.infer<typeof cancelAdoptionsSchema>
