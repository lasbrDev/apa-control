import { makeCreateRevenueUseCase } from '@/use-cases/revenue/create-revenue/create-revenue.factory'
import { saveUploadFile } from '@/utils/files/save-upload-file'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createRevenueSchema } from './create-revenue.schema'

export async function createRevenueController(request: FastifyRequest, reply: FastifyReply) {
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

  const body = createRevenueSchema.parse(payload)
  const employeeId = request.user.id

  const createRevenueUseCase = makeCreateRevenueUseCase()
  const id = await createRevenueUseCase.execute(
    {
      ...body,
      proof: uploadedProofPath ?? body.proof ?? null,
    },
    employeeId,
  )

  return reply.status(201).send({ id })
}
