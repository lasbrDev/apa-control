import { makeUpdateAdoptionUseCase } from '@/use-cases/adoption/update-adoption/update-adoption.factory'
import { saveUploadFile } from '@/utils/files/save-upload-file'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateAdoptionSchema } from './update-adoption.schema'

export async function updateAdoptionController(request: FastifyRequest, reply: FastifyReply) {
  let payload: Record<string, unknown> = (request.body as Record<string, unknown>) ?? {}
  let uploadedProofPath: string | null = null

  if (request.isMultipart()) {
    payload = {}

    for await (const part of request.parts()) {
      if (part.type === 'file') {
        if (part.fieldname === 'proofFile' && part.filename) {
          uploadedProofPath = await saveUploadFile(part, 'adoption')
        }
        continue
      }

      payload[part.fieldname] = part.value
    }
  }

  const body = updateAdoptionSchema.parse(payload)

  const updateAdoptionUseCase = makeUpdateAdoptionUseCase()
  await updateAdoptionUseCase.execute({
    ...body,
    proof: uploadedProofPath ?? body.proof ?? null,
  })

  return reply.status(204).send()
}
