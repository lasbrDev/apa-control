import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { createProcedureTypeController } from './create-procedure-type/create-procedure-type.controller'
import { getProcedureTypeByIdController } from './get-procedure-type-by-id/get-procedure-type-by-id.controller'
import { listProcedureTypesController } from './list-procedure-types/list-procedure-types.controller'
import { removeProcedureTypeController } from './remove-procedure-type/remove-procedure-type.controller'
import { updateProcedureTypeController } from './update-procedure-type/update-procedure-type.controller'

export async function procedureTypeRoutes(app: FastifyInstance) {
  app.post('/procedure-type.add', authorize('AdminPanel', 'ProcedureTypes'), createProcedureTypeController)
  app.put('/procedure-type.update', authorize('AdminPanel', 'ProcedureTypes'), updateProcedureTypeController)
  app.get('/procedure-type.list', authorize('AdminPanel', 'ProcedureTypes'), listProcedureTypesController)
  app.get('/procedure-type.key/:id', authorize('AdminPanel', 'ProcedureTypes'), getProcedureTypeByIdController)
  app.delete('/procedure-type.delete/:id', authorize('AdminPanel', 'ProcedureTypes'), removeProcedureTypeController)
}
