import { makeListVeterinaryClinicsUseCase } from '@/use-cases/veterinary-clinic/list-veterinary-clinics/list-veterinary-clinics.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listVeterinaryClinicsSchema } from './list-veterinary-clinics.schema'

export async function listVeterinaryClinicsController(request: FastifyRequest, reply: FastifyReply) {
  const data = listVeterinaryClinicsSchema.parse(request.query)
  const listVeterinaryClinicsUseCase = makeListVeterinaryClinicsUseCase()
  const [count, items] = await listVeterinaryClinicsUseCase.execute(data)

  reply.header('X-Total-Count', count)

  return items
}
