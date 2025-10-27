import { ApprovalStatusValues } from '@/database/schema/enums/approval-status'
import { z } from 'zod'

export const updateAdopterSchema = z.object({
  id: z.number({ error: 'O código do adotante é obrigatório.' }),
  name: z.string({ error: 'O nome é obrigatório.' }).trim().max(100, 'O nome deve ter no máximo 100 caracteres.'),
  cpf: z.string({ error: 'O CPF é obrigatório.' }).trim().length(11, 'O CPF deve ter 11 caracteres.'),
  email: z.string({ error: 'O email é obrigatório.' }).trim().email('Digite um email válido.'),
  phone: z
    .string({ error: 'O telefone é obrigatório.' })
    .trim()
    .max(20, 'O telefone deve ter no máximo 20 caracteres.'),
  address: z.string({ error: 'O endereço é obrigatório.' }).trim(),
  familyIncome: z.number({ error: 'A renda familiar é obrigatória.' }),
  animalExperience: z.coerce.boolean({ error: 'O campo experiência com animais é obrigatório.' }),
  approvalStatus: z.enum(ApprovalStatusValues, { error: 'O status de aprovação é obrigatório.' }),
})
