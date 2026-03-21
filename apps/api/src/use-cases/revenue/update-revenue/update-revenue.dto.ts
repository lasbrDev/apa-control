import type { updateRevenueSchema } from '@/http/controllers/revenue/update-revenue/update-revenue.schema'
import type { z } from 'zod'

export type UpdateRevenueData = z.infer<typeof updateRevenueSchema>
