import type { reverseRevenueSchema } from '@/http/controllers/revenue/reverse-revenue/reverse-revenue.schema'
import type { z } from 'zod'

export type ReverseRevenueData = z.infer<typeof reverseRevenueSchema>
