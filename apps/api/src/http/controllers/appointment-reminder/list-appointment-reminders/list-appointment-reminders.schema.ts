import { apiQueryStringSchema } from '@/utils/drizzle/api-query-schema'
import { z } from 'zod'

export const listAppointmentRemindersSchema = apiQueryStringSchema.extend({
  readStatus: z.enum(['all', 'read', 'unread']).optional(),
})
