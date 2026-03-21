import { z } from 'zod'

export const createAnamnesisSchema = z.object({
  appointmentId: z.coerce.number().int().positive('Consulta é obrigatória'),
  symptomsPresented: z.string().min(1, 'Sintomas apresentados é obrigatório'),
  dietaryHistory: z.string().optional().nullable(),
  behavioralHistory: z.string().optional().nullable(),
  requestedExams: z.string().optional().nullable(),
  presumptiveDiagnosis: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
})
