import { z } from 'zod'

export const createVeterinaryClinicSchema = z.object({
  name: z.string({ error: 'O nome é obrigatório.' }).trim().max(100, 'O nome deve ter no máximo 100 caracteres.'),
  cnpj: z.string({ error: 'O CNPJ é obrigatório.' }).trim().length(14, 'O CNPJ deve ter 14 caracteres.'),
  phone: z
    .string({ error: 'O telefone é obrigatório.' })
    .trim()
    .max(20, 'O telefone deve ter no máximo 20 caracteres.'),
  address: z.string({ error: 'O endereço é obrigatório.' }),
  responsible: z
    .string({ error: 'O responsável é obrigatório.' })
    .trim()
    .max(100, 'O responsável deve ter no máximo 100 caracteres.'),
  specialties: z.string().optional(),
  active: z.coerce.boolean({ error: 'O status é obrigatório.' }),
})
