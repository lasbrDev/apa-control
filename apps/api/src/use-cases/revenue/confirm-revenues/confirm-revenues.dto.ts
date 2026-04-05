import type { confirmRevenuesSchema } from '@/http/controllers/revenue/confirm-revenues/confirm-revenues.schema'
import type { z } from 'zod'

export type ConfirmRevenuesData = z.infer<typeof confirmRevenuesSchema>
