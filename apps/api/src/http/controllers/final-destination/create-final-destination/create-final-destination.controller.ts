import { makeCreateFinalDestinationUseCase } from '@/use-cases/final-destination/create-final-destination/create-final-destination.factory'
import { saveUploadFile } from '@/utils/files/save-upload-file'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createFinalDestinationSchema } from './create-final-destination.schema'

export async function createFinalDestinationController(request: FastifyRequest, reply: FastifyReply) {
  let payload: Record<string, unknown> = (request.body as Record<string, unknown>) ?? {}
  let uploadedProofPath: string | null = null

  if (request.isMultipart()) {
    payload = {}

    for await (const part of request.parts()) {
      if (part.type === 'file') {
        if (part.fieldname === 'proofFile' && part.filename) {
          uploadedProofPath = await saveUploadFile(part, 'final-destination')
        }
        continue
      }

      payload[part.fieldname] = part.value
    }
  }

  const body = createFinalDestinationSchema.parse(payload)
  const employeeId = request.user.id

  const createFinalDestinationUseCase = makeCreateFinalDestinationUseCase()
  const id = await createFinalDestinationUseCase.execute({
    animalId: body.animalId,
    destinationTypeId: body.destinationTypeId,
    destinationDate: body.destinationDate,
    reason: body.reason,
    observations: body.observations ?? null,
    proof: uploadedProofPath ?? body.proof ?? null,
    employeeId,
  })

  return reply.status(201).send({ id })
}
