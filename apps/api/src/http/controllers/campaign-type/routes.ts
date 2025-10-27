import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { createCampaignTypeController } from './create-campaign-type/create-campaign-type.controller'
import { getCampaignTypeByIdController } from './get-campaign-type-by-id/get-campaign-type-by-id.controller'
import { listCampaignTypesController } from './list-campaign-types/list-campaign-types.controller'
import { removeCampaignTypeController } from './remove-campaign-type/remove-campaign-type.controller'
import { updateCampaignTypeController } from './update-campaign-type/update-campaign-type.controller'

export async function campaignTypeRoutes(app: FastifyInstance) {
  app.post('/campaign-type.add', authorize('AdminPanel', 'CampaignTypes'), createCampaignTypeController)
  app.put('/campaign-type.update', authorize('AdminPanel', 'CampaignTypes'), updateCampaignTypeController)
  app.get('/campaign-type.list', authorize('AdminPanel', 'CampaignTypes'), listCampaignTypesController)
  app.get('/campaign-type.key/:id', authorize('AdminPanel', 'CampaignTypes'), getCampaignTypeByIdController)
  app.delete('/campaign-type.delete/:id', authorize('AdminPanel', 'CampaignTypes'), removeCampaignTypeController)
}
