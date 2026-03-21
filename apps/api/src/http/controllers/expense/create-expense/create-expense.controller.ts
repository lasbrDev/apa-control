import { makeCreateExpenseUseCase } from '@/use-cases/expense/create-expense/create-expense.factory'
import { saveUploadFile } from '@/utils/files/save-upload-file'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createExpenseSchema } from './create-expense.schema'

export async function createExpenseController(request: FastifyRequest, reply: FastifyReply) {
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

  const body = createExpenseSchema.parse(payload)
  const employeeId = request.user.id

  const createExpenseUseCase = makeCreateExpenseUseCase()
  const id = await createExpenseUseCase.execute(
    {
      ...body,
      proof: uploadedProofPath ?? body.proof ?? null,
    },
    employeeId,
  )

  return reply.status(201).send({ id })
}
