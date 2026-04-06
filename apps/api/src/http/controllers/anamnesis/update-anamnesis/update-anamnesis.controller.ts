import { makeUpdateAnamnesisUseCase } from '@/use-cases/anamnesis/update-anamnesis/update-anamnesis.factory'
import { saveUploadFile } from '@/utils/files/save-upload-file'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateAnamnesisSchema } from './update-anamnesis.schema'

export async function updateAnamnesisController(request: FastifyRequest, reply: FastifyReply) {
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

  const body = updateAnamnesisSchema.parse(payload)
  const employeeId = request.user.id

  const useCase = makeUpdateAnamnesisUseCase()
  await useCase.execute(
    {
      ...body,
      proof: uploadedProofPath ?? body.proof ?? null,
    },
    employeeId,
  )

  return reply.status(204).send()
}
