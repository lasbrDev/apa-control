import type { cancelRevenuesSchema } from '@/http/controllers/revenue/cancel-revenues/cancel-revenues.schema'
import type { z } from 'zod'

export type CancelRevenuesData = z.infer<typeof cancelRevenuesSchema>
