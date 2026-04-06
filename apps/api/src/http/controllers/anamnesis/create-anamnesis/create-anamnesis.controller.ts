import { makeCreateAnamnesisUseCase } from '@/use-cases/anamnesis/create-anamnesis/create-anamnesis.factory'
import { saveUploadFile } from '@/utils/files/save-upload-file'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createAnamnesisSchema } from './create-anamnesis.schema'

export async function createAnamnesisController(request: FastifyRequest, reply: FastifyReply) {
  let payload: Record<string, unknown> = (request.body as Record<string, unknown>) ?? {}
  let uploadedProofPath: string | null = null

  if (request.isMultipart()) {
    payload = {}

    for await (const part of request.parts()) {
      if (part.type === 'file') {
        if (part.fieldname === 'proofFile' && part.filename) {
          uploadedProofPath = await saveUploadFile(part, 'anamnesis')
        }
        continue
      }

      payload[part.fieldname] = part.value
    }
  }

  const body = createAnamnesisSchema.parse(payload)
  const employeeId = request.user.id

  const useCase = makeCreateAnamnesisUseCase()
  const id = await useCase.execute(
    {
      ...body,
      proof: uploadedProofPath ?? body.proof ?? null,
    },
    employeeId,
  )

  return reply.status(201).send({ id })
}
