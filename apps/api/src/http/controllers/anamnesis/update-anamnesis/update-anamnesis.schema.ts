import { z } from 'zod'

export const updateAnamnesisSchema = z.object({
  id: z.coerce.number().int().positive('ID deve ser um número positivo'),
  appointmentId: z.coerce.number().int().positive('Consulta é obrigatória'),
  symptomsPresented: z.string().nullish(),
  dietaryHistory: z.string().nullish(),
  behavioralHistory: z.string().nullish(),
  requestedExams: z.string().nullish(),
  presumptiveDiagnosis: z.string().nullish(),
  observations: z.string().nullish(),
  proof: z.string().nullish(),
})
