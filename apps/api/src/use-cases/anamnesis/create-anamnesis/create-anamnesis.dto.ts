import type { createAnamnesisSchema } from '@/http/controllers/anamnesis/create-anamnesis/create-anamnesis.schema'
import type { z } from 'zod'

export type CreateAnamnesisData = z.infer<typeof createAnamnesisSchema>
