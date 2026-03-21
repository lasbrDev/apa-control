import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { createClinicalProcedureController } from './create-clinical-procedure/create-clinical-procedure.controller'
import { getClinicalProcedureByIdController } from './get-clinical-procedure-by-id/get-clinical-procedure-by-id.controller'
import { listClinicalProceduresController } from './list-clinical-procedures/list-clinical-procedures.controller'
import { removeClinicalProcedureController } from './remove-clinical-procedure/remove-clinical-procedure.controller'
import { updateClinicalProcedureController } from './update-clinical-procedure/update-clinical-procedure.controller'

export async function clinicalProcedureRoutes(app: FastifyInstance) {
  app.post('/clinical-procedure.add', authorize('AdminPanel', 'ClinicalProcedures'), createClinicalProcedureController)
  app.put(
    '/clinical-procedure.update',
    authorize('AdminPanel', 'ClinicalProcedures'),
    updateClinicalProcedureController,
  )
  app.get('/clinical-procedure.list', authorize('AdminPanel', 'ClinicalProcedures'), listClinicalProceduresController)
  app.get(
    '/clinical-procedure.key/:id',
    authorize('AdminPanel', 'ClinicalProcedures'),
    getClinicalProcedureByIdController,
  )
  app.delete(
    '/clinical-procedure.delete/:id',
    authorize('AdminPanel', 'ClinicalProcedures'),
    removeClinicalProcedureController,
  )
}
