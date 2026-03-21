import { AdoptionStatusValues } from '@/database/schema/enums/adoption-status'
import { z } from 'zod'

export const updateAdoptionSchema = z.object({
  id: z.coerce.number().int().positive('ID deve ser um número positivo'),
  adopterId: z.coerce.number().int().positive('Adotante é obrigatório'),
  adoptionDate: z.string().min(1, 'Data da adoção é obrigatória'),
  termSigned: z.preprocess((val) => {
    if (val === 'true' || val === true) return true
    if (val === 'false' || val === false) return false
    return val
  }, z.boolean()),
  adaptationPeriod: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.union([z.coerce.number().int().nonnegative(), z.null()]).optional(),
  ),
  status: z.enum(AdoptionStatusValues),
  observations: z.string().optional().nullable(),
})
