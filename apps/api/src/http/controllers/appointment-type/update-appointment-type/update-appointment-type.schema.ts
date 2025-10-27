import { UrgencyLevelValues } from '@/database/schema/enums/urgency-level'
import { z } from 'zod'

export const updateAppointmentTypeSchema = z.object({
  id: z.number({ error: 'O código do tipo de consulta é obrigatório.' }),
  name: z.string({ error: 'O nome é obrigatório.' }).trim().max(100, 'O nome deve ter no máximo 100 caracteres.'),
  description: z.string({ error: 'A descrição é obrigatória.' }).trim(),
  urgency: z.enum(UrgencyLevelValues, { error: 'A urgência é obrigatória.' }),
  active: z.coerce.boolean({ error: 'O status é obrigatório.' }),
})
