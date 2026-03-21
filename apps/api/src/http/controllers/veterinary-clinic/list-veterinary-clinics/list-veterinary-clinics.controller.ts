import { makeListVeterinaryClinicsUseCase } from '@/use-cases/veterinary-clinic/list-veterinary-clinics/list-veterinary-clinics.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listVeterinaryClinicsSchema } from './list-veterinary-clinics.schema'

export async function listVeterinaryClinicsController(request: FastifyRequest, reply: FastifyReply) {
  const data = listVeterinaryClinicsSchema.parse(request.query)
  const listVeterinaryClinicsUseCase = makeListVeterinaryClinicsUseCase()
  const [count, items] = await listVeterinaryClinicsUseCase.execute(data)

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Clinicas Veterinarias', 'clinicas-veterinarias', items)
  }

  reply.header('X-Total-Count', count)

  return items
}
