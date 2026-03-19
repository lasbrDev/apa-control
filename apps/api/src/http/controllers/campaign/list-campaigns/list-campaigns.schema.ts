import { CampaignStatusValues } from '@/database/schema/enums/campaign-status'
import { apiQueryStringSchema } from '@/utils/drizzle/api-query-schema'
import { z } from 'zod'

export const listCampaignsSchema = apiQueryStringSchema
  .extend({
    title: z.string().optional(),
    status: z.enum(CampaignStatusValues).optional(),
    campaignTypeId: z.coerce.number().int().positive().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true
      return new Date(data.startDate) <= new Date(data.endDate)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['endDate'],
    },
  )
