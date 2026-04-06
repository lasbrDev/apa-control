import type { confirmAdoptionsSchema } from '@/http/controllers/adoption/confirm-adoptions/confirm-adoptions.schema'
import type { z } from 'zod'

export type ConfirmAdoptionsData = z.infer<typeof confirmAdoptionsSchema>
