import { makeUpdateFinalDestinationUseCase } from '@/use-cases/final-destination/update-final-destination/update-final-destination.factory'
import { saveUploadFile } from '@/utils/files/save-upload-file'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateFinalDestinationSchema } from './update-final-destination.schema'

export async function updateFinalDestinationController(request: FastifyRequest, reply: FastifyReply) {
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

  const data = updateFinalDestinationSchema.parse(payload)
  const employeeId = request.user.id

  const updateFinalDestinationUseCase = makeUpdateFinalDestinationUseCase()
  await updateFinalDestinationUseCase.execute({
    ...data,
    proof: uploadedProofPath ?? data.proof ?? null,
    employeeId,
  })

  return reply.status(204).send()
}
