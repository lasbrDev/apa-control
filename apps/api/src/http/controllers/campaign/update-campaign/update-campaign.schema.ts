import { CampaignStatusValues } from '@/database/schema/enums/campaign-status'
import { z } from 'zod'

export const updateCampaignSchema = z
  .object({
    id: z.number().int().positive('ID deve ser um número positivo'),
    campaignTypeId: z.number().int().positive('Tipo de campanha é obrigatório'),
    title: z.string().min(1, 'Título é obrigatório').max(200),
    description: z.string().min(1, 'Descrição é obrigatória'),
    startDate: z.string().min(1, 'Data inicial é obrigatória'),
    endDate: z.string().min(1, 'Data final é obrigatória'),
    fundraisingGoal: z.number().nonnegative('Meta de arrecadação deve ser maior ou igual a zero'),
    status: z.enum(CampaignStatusValues),
    observations: z.string().nullish(),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'A data inicial deve ser menor ou igual à data final.',
    path: ['endDate'],
  })
