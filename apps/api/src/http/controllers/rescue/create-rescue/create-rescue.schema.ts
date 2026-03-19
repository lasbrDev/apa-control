import { z } from 'zod'

const createAnimalPartSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  species: z.string().min(1, 'Espécie é obrigatória'),
  breed: z.string().max(50).optional().nullable(),
  size: z.string().min(1, 'Porte é obrigatório'),
  sex: z.string().min(1, 'Sexo é obrigatório'),
  age: z.number().int().min(0),
  healthCondition: z.string().min(1, 'Condição de saúde é obrigatória'),
  entryDate: z.string().min(1, 'Data de entrada é obrigatória'),
  observations: z.string().optional().nullable(),
  status: z.string().min(1, 'Status é obrigatório'),
})

export const createRescueSchema = z
  .object({
    animalId: z.number().int().positive().optional(),
    animal: createAnimalPartSchema.optional(),
    rescueDate: z.string().min(1, 'Data do resgate é obrigatória'),
    locationFound: z.string().min(1, 'Local encontrado é obrigatório').max(200),
    circumstances: z.string().min(1, 'Circunstâncias são obrigatórias'),
    foundConditions: z.string().min(1, 'Condições em que foi encontrado é obrigatório'),
    immediateProcedures: z.string().optional().nullable(),
    observations: z.string().optional().nullable(),
  })
  .refine((data) => (data.animalId != null) !== (data.animal != null), {
    message: 'Informe apenas um: animalId (animal existente) ou dados do animal (novo). Não envie os dois.',
    path: ['animalId'],
  })

export type CreateRescueBody = z.infer<typeof createRescueSchema>
