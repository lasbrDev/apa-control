import { makeCreateCampaignUseCase } from '@/use-cases/campaign/create-campaign/create-campaign.factory'
import { saveUploadFile } from '@/utils/files/save-upload-file'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createCampaignSchema } from './create-campaign.schema'

export async function createCampaignController(request: FastifyRequest, reply: FastifyReply) {
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

  const body = createCampaignSchema.parse(payload)

  const createCampaignUseCase = makeCreateCampaignUseCase()
  const id = await createCampaignUseCase.execute({
    campaignTypeId: body.campaignTypeId,
    title: body.title,
    description: body.description,
    startDate: body.startDate,
    endDate: body.endDate,
    fundraisingGoal: body.fundraisingGoal,
    proof: uploadedProofPath ?? body.proof ?? null,
    observations: body.observations ?? null,
  })

  return reply.status(201).send({ id })
}
