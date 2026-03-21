import { ProcedureStatusValues } from '@/database/schema/enums/procedure-status'
import { apiQueryStringSchema } from '@/utils/drizzle/api-query-schema'
import { z } from 'zod'

export const listClinicalProceduresSchema = apiQueryStringSchema
  .extend({
    animalName: z.string().optional(),
    procedureTypeId: z.coerce.number().int().positive().optional(),
    appointmentId: z.coerce.number().int().positive().optional(),
    employeeId: z.coerce.number().int().positive().optional(),
    status: z.enum(ProcedureStatusValues).optional(),
    procedureDateStart: z.string().min(1, 'Data inicial é obrigatória.'),
    procedureDateEnd: z.string().min(1, 'Data final é obrigatória.'),
  })
  .refine(
    (data) => {
      if (!data.procedureDateStart || !data.procedureDateEnd) return true
      return new Date(data.procedureDateStart) <= new Date(data.procedureDateEnd)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['procedureDateEnd'],
    },
  )
