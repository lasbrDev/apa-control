import { makeUpdateExpenseUseCase } from '@/use-cases/expense/update-expense/update-expense.factory'
import { saveUploadFile } from '@/utils/files/save-upload-file'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateExpenseSchema } from './update-expense.schema'

export async function updateExpenseController(request: FastifyRequest, reply: FastifyReply) {
  let payload: Record<string, unknown> = (request.body as Record<string, unknown>) ?? {}
  let uploadedProofPath: string | null = null

  if (request.isMultipart()) {
    payload = {}

    for await (const part of request.parts()) {
      if (part.type === 'file') {
        if (part.fieldname === 'proofFile' && part.filename) {
          uploadedProofPath = await saveUploadFile(part, 'expense')
        }
        continue
      }

      payload[part.fieldname] = part.value
    }
  }

  const body = updateExpenseSchema.parse(payload)
  const employeeId = request.user.id

  const updateExpenseUseCase = makeUpdateExpenseUseCase()
  await updateExpenseUseCase.execute(
    {
      ...body,
      proof: uploadedProofPath ?? body.proof ?? null,
    },
    employeeId,
  )

  return reply.status(204).send()
}
