import { z } from 'zod'

export const createAnimalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  species: z.string().min(1, 'Espécie é obrigatória'),
  breed: z.string().max(50, 'Raça deve ter no máximo 50 caracteres').nullish(),
  size: z.string().min(1, 'Porte é obrigatório'),
  sex: z.string().min(1, 'Sexo é obrigatório'),
  birthYear: z.number().int().min(1900, 'Ano de nascimento inválido').nullish(),
  healthCondition: z.string().min(1, 'Condição de saúde é obrigatória'),
  entryDate: z.string().min(1, 'Data de entrada é obrigatória'),
  observations: z.string().nullish(),
})
