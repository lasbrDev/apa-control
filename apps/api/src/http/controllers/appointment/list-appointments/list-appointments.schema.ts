import { AppointmentStatusValues } from '@/database/schema/enums/appointment-status'
import { ConsultationTypeValues } from '@/database/schema/enums/consultation-type'
import { apiQueryStringSchema } from '@/utils/drizzle/api-query-schema'
import { z } from 'zod'

const appointmentStatusFilterSchema = z.union([z.enum(AppointmentStatusValues), z.literal('pendente')])

export const listAppointmentsSchema = apiQueryStringSchema
  .extend({
    animalName: z.string().optional(),
    appointmentTypeId: z.coerce.number().int().positive().optional(),
    clinicId: z.coerce.number().int().positive().optional(),
    consultationType: z.enum(ConsultationTypeValues).optional(),
    status: appointmentStatusFilterSchema.optional(),
    employeeId: z.coerce.number().int().positive().optional(),
    appointmentDateStart: z.string().min(1, 'Data inicial é obrigatória.'),
    appointmentDateEnd: z.string().min(1, 'Data final é obrigatória.'),
  })
  .refine(
    (data) => {
      if (!data.appointmentDateStart || !data.appointmentDateEnd) return true
      return new Date(data.appointmentDateStart) <= new Date(data.appointmentDateEnd)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['appointmentDateEnd'],
    },
  )
