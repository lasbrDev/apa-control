import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { cancelCampaignController } from './cancel-campaign/cancel-campaign.controller'
import { completeCampaignController } from './complete-campaign/complete-campaign.controller'
import { createCampaignController } from './create-campaign/create-campaign.controller'
import { getCampaignByIdController } from './get-campaign-by-id/get-campaign-by-id.controller'
import { listCampaignsController } from './list-campaigns/list-campaigns.controller'
import { removeCampaignController } from './remove-campaign/remove-campaign.controller'
import { updateCampaignController } from './update-campaign/update-campaign.controller'

export async function campaignRoutes(app: FastifyInstance) {
  app.post('/campaign.add', authorize('AdminPanel', 'Campaigns'), createCampaignController)
  app.put('/campaign.update', authorize('AdminPanel', 'Campaigns'), updateCampaignController)
  app.get('/campaign.list', authorize('AdminPanel', 'Campaigns'), listCampaignsController)
  app.get('/campaign.key/:id', authorize('AdminPanel', 'Campaigns'), getCampaignByIdController)
  app.delete('/campaign.delete/:id', authorize('AdminPanel', 'Campaigns'), removeCampaignController)
  app.post('/campaign.cancel/:id', authorize('AdminPanel', 'Campaigns'), cancelCampaignController)
  app.post('/campaign.complete/:id', authorize('AdminPanel', 'Campaigns'), completeCampaignController)
}
