import type { createRevenueSchema } from '@/http/controllers/revenue/create-revenue/create-revenue.schema'
import type { z } from 'zod'

export type CreateRevenueData = z.infer<typeof createRevenueSchema>
