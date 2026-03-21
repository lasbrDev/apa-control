import { makeListAccessProfilesUseCase } from '@/use-cases/access-profile/list-access-profiles/list-access-profiles.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

const querySchema = z.object({
  exportType: z.enum(['csv', 'xlsx', 'pdf']).optional(),
})

export async function listAccessProfilesController(request: FastifyRequest, reply: FastifyReply) {
  const data = querySchema.parse(request.query)
  const listAccessProfilesUseCase = makeListAccessProfilesUseCase()
  const [count, items] = await listAccessProfilesUseCase.execute()

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Perfis', 'perfis', items)
  }

  reply.header('X-Total-Count', count)

  return items
}
