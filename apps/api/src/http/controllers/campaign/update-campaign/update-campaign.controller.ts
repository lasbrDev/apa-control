import { makeUpdateCampaignUseCase } from '@/use-cases/campaign/update-campaign/update-campaign.factory'
import { saveUploadFile } from '@/utils/files/save-upload-file'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateCampaignSchema } from './update-campaign.schema'

export async function updateCampaignController(request: FastifyRequest, reply: FastifyReply) {
  let payload: Record<string, unknown> = (request.body as Record<string, unknown>) ?? {}
  let uploadedProofPath: string | null = null

  if (request.isMultipart()) {
    payload = {}

    for await (const part of request.parts()) {
      if (part.type === 'file') {
        if (part.fieldname === 'proofFile' && part.filename) {
          uploadedProofPath = await saveUploadFile(part, 'campaign')
        }
        continue
      }

      payload[part.fieldname] = part.value
    }
  }

  const data = updateCampaignSchema.parse(payload)

  const updateCampaignUseCase = makeUpdateCampaignUseCase()
  await updateCampaignUseCase.execute({
    ...data,
    proof: uploadedProofPath ?? data.proof ?? null,
  })

  return reply.status(204).send()
}
