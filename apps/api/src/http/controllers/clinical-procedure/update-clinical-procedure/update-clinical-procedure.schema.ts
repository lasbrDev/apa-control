import { ProcedureStatusValues } from '@/database/schema/enums/procedure-status'
import { z } from 'zod'

const optionalId = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : v),
  z.union([z.coerce.number().int().positive(), z.null()]),
)

export const updateClinicalProcedureSchema = z.object({
  id: z.coerce.number().int().positive('ID deve ser um número positivo'),
  animalId: z.coerce.number().int().positive('Animal é obrigatório'),
  procedureTypeId: z.coerce.number().int().positive('Tipo de procedimento é obrigatório'),
  appointmentId: optionalId,
  procedureDate: z.string().min(1, 'Data/hora do procedimento é obrigatória'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  actualCost: z.coerce.number().nonnegative('Custo deve ser maior ou igual a zero'),
  observations: z.string().nullish(),
  status: z.enum(ProcedureStatusValues),
})
