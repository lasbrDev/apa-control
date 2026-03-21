import { makeUpdateRevenueUseCase } from '@/use-cases/revenue/update-revenue/update-revenue.factory'
import { saveUploadFile } from '@/utils/files/save-upload-file'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateRevenueSchema } from './update-revenue.schema'

export async function updateRevenueController(request: FastifyRequest, reply: FastifyReply) {
  let payload: Record<string, unknown> = (request.body as Record<string, unknown>) ?? {}
  let uploadedProofPath: string | null = null

  if (request.isMultipart()) {
    payload = {}

    for await (const part of request.parts()) {
      if (part.type === 'file') {
        if (part.fieldname === 'proofFile' && part.filename) {
          uploadedProofPath = await saveUploadFile(part, 'revenue')
        }
        continue
      }

      payload[part.fieldname] = part.value
    }
  }

  const body = updateRevenueSchema.parse(payload)

  const updateRevenueUseCase = makeUpdateRevenueUseCase()
  await updateRevenueUseCase.execute({
    ...body,
    proof: uploadedProofPath ?? body.proof ?? null,
  })

  return reply.status(204).send()
}
