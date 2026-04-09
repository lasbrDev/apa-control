import { z } from 'zod'

export const readAppointmentRemindersSchema = z.object({
  reminderIds: z.array(z.number().int().positive()).default([]),
})
