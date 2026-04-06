import { z } from 'zod'

export const disableVeterinaryClinicSchema = z.object({
  id: z.number({ error: 'O código da clínica veterinária é obrigatório.' }),
  disabled: z.boolean({ error: 'O status de desabilitação é obrigatório.' }),
})
