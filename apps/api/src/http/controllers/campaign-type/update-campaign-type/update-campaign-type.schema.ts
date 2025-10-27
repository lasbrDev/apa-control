import { CampaignCategoryValues } from '@/database/schema/enums/campaign-category'
import { z } from 'zod'

export const updateCampaignTypeSchema = z.object({
  id: z.number({ error: 'O código do tipo de campanha é obrigatório.' }),
  name: z.string({ error: 'O nome é obrigatório.' }).trim().max(100, 'O nome deve ter no máximo 100 caracteres.'),
  description: z.string({ error: 'A descrição é obrigatória.' }).trim(),
  category: z.enum(CampaignCategoryValues, { error: 'A categoria é obrigatória.' }),
  active: z.coerce.boolean({ error: 'O status é obrigatório.' }),
})
