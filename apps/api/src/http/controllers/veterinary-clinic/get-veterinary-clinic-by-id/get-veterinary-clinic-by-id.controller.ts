import { makeGetVeterinaryClinicByIdUseCase } from '@/use-cases/veterinary-clinic/get-veterinary-clinic-by-id/get-veterinary-clinic-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getVeterinaryClinicByIdSchema } from './get-veterinary-clinic-by-id.schema'

export async function getVeterinaryClinicByIdController(request: FastifyRequest) {
  const { id } = getVeterinaryClinicByIdSchema.parse(request.params)

  const getVeterinaryClinicByIdUseCase = makeGetVeterinaryClinicByIdUseCase()
  const result = await getVeterinaryClinicByIdUseCase.execute({ id })

  return result
}
