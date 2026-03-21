import { AppointmentStatusValues } from '@/database/schema/enums/appointment-status'
import { ConsultationTypeValues } from '@/database/schema/enums/consultation-type'
import { z } from 'zod'

const optionalId = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : v),
  z.union([z.coerce.number().int().positive(), z.null()]),
)

export const createAppointmentSchema = z.object({
  animalId: z.coerce.number().int().positive('Animal é obrigatório'),
  appointmentTypeId: z.coerce.number().int().positive('Tipo de consulta é obrigatório'),
  clinicId: optionalId,
  appointmentDate: z.string().min(1, 'Data/hora da consulta é obrigatória'),
  consultationType: z.enum(ConsultationTypeValues),
  status: z.enum(AppointmentStatusValues).optional(),
  observations: z.string().optional().nullable(),
})
