import { PostStatusValues } from '@/database/schema/enums/post-status'
import { PostTypeValues } from '@/database/schema/enums/post-type'
import { z } from 'zod'

export const updatePostSchema = z.object({
  id: z.coerce.number().int().positive('ID deve ser um número positivo'),
  title: z.string().min(1, 'Título é obrigatório').max(200),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  type: z.enum(PostTypeValues),
  publicationDate: z.string().min(1, 'Data de publicação é obrigatória'),
  status: z.enum(PostStatusValues),
  relatedAnimals: z.string().nullish(),
})
