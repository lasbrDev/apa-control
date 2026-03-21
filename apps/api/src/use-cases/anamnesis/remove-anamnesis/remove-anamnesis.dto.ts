import type { removeAnamnesisSchema } from '@/http/controllers/anamnesis/remove-anamnesis/remove-anamnesis.schema'
import type { z } from 'zod'

export type RemoveAnamnesisData = z.infer<typeof removeAnamnesisSchema>
