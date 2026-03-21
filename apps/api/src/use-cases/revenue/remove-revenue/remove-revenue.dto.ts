import type { removeRevenueSchema } from '@/http/controllers/revenue/remove-revenue/remove-revenue.schema'
import type { z } from 'zod'

export type RemoveRevenueData = z.infer<typeof removeRevenueSchema>
