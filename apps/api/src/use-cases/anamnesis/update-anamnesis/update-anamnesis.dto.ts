import type { updateAnamnesisSchema } from '@/http/controllers/anamnesis/update-anamnesis/update-anamnesis.schema'
import type { z } from 'zod'

export type UpdateAnamnesisData = z.infer<typeof updateAnamnesisSchema>
