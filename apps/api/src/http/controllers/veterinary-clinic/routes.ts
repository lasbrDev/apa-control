import { authorize } from '@/http/middlewares/authorize'
import type { FastifyInstance } from 'fastify'
import { createVeterinaryClinicController } from './create-veterinary-clinic/create-veterinary-clinic.controller'
import { disableVeterinaryClinicController } from './disable-veterinary-clinic/disable-veterinary-clinic.controller'
import { getVeterinaryClinicByIdController } from './get-veterinary-clinic-by-id/get-veterinary-clinic-by-id.controller'
import { listVeterinaryClinicsController } from './list-veterinary-clinics/list-veterinary-clinics.controller'
import { removeVeterinaryClinicController } from './remove-veterinary-clinic/remove-veterinary-clinic.controller'
import { updateVeterinaryClinicController } from './update-veterinary-clinic/update-veterinary-clinic.controller'

export async function veterinaryClinicRoutes(app: FastifyInstance) {
  app.post('/veterinary-clinic.add', authorize('AdminPanel', 'VeterinaryClinics'), createVeterinaryClinicController)
  app.put('/veterinary-clinic.update', authorize('AdminPanel', 'VeterinaryClinics'), updateVeterinaryClinicController)
  app.get('/veterinary-clinic.list', authorize('AdminPanel', 'VeterinaryClinics'), listVeterinaryClinicsController)
  app.get('/veterinary-clinic.key/:id', authorize('AdminPanel', 'VeterinaryClinics'), getVeterinaryClinicByIdController)
  app.post(
    '/veterinary-clinic.disable',
    authorize('AdminPanel', 'VeterinaryClinics'),
    disableVeterinaryClinicController,
  )
  app.delete(
    '/veterinary-clinic.delete/:id',
    authorize('AdminPanel', 'VeterinaryClinics'),
    removeVeterinaryClinicController,
  )
}
