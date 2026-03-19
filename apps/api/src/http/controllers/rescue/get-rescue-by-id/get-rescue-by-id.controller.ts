import { makeGetRescueByIdUseCase } from '@/use-cases/rescue/get-rescue-by-id/get-rescue-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getRescueByIdSchema } from './get-rescue-by-id.schema'

export async function getRescueByIdController(request: FastifyRequest) {
  const { id } = getRescueByIdSchema.parse(request.params)

  const getRescueByIdUseCase = makeGetRescueByIdUseCase()
  const result = await getRescueByIdUseCase.execute({ id })

  return result
}
