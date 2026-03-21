import type { getRevenueByIdSchema } from '@/http/controllers/revenue/get-revenue-by-id/get-revenue-by-id.schema'
import type { z } from 'zod'

export type GetRevenueByIdData = z.infer<typeof getRevenueByIdSchema>
