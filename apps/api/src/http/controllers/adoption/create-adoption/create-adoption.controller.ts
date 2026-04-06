import { makeCreateAdoptionUseCase } from '@/use-cases/adoption/create-adoption/create-adoption.factory'
import { saveUploadFile } from '@/utils/files/save-upload-file'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createAdoptionSchema } from './create-adoption.schema'

export async function createAdoptionController(request: FastifyRequest, reply: FastifyReply) {
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

  const body = createAdoptionSchema.parse(payload)
  const employeeId = request.user.id

  const createAdoptionUseCase = makeCreateAdoptionUseCase()
  const id = await createAdoptionUseCase.execute(
    {
      ...body,
      proof: uploadedProofPath ?? body.proof ?? null,
    },
    employeeId,
  )

  return reply.status(201).send({ id })
}
