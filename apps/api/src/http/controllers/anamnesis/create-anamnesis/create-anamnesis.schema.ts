import { z } from 'zod'

export const createAnamnesisSchema = z.object({
  appointmentId: z.coerce.number().int().positive('Consulta é obrigatória'),
  symptomsPresented: z.string().min(1, 'Sintomas apresentados é obrigatório'),
  dietaryHistory: z.string().nullish(),
  behavioralHistory: z.string().nullish(),
  requestedExams: z.string().nullish(),
  presumptiveDiagnosis: z.string().nullish(),
  observations: z.string().nullish(),
})
