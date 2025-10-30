import { z } from 'zod'

export const getDashboardStatsSchema = z.object({
  year: z.coerce.number().min(2020).max(2030).default(new Date().getFullYear()),
})
