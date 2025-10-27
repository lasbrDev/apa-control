import { UrgencyLevelValues } from '@/database/schema/enums/urgency-level'
import { z } from 'zod'

export const createAppointmentTypeSchema = z.object({
  name: z.string({ error: 'O nome é obrigatório.' }).trim().max(100, 'O nome deve ter no máximo 100 caracteres.'),
  description: z.string({ error: 'A descrição é obrigatória.' }),
  urgency: z.enum(UrgencyLevelValues, { error: 'A urgência é obrigatória.' }),
  active: z.coerce.boolean({ error: 'O status é obrigatório.' }),
})
