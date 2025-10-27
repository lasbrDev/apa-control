import { VeterinaryClinicRepository } from '@/repositories/veterinary-clinic.repository'
import { GetVeterinaryClinicByIdUseCase } from '@/use-cases/veterinary-clinic/get-veterinary-clinic-by-id/get-veterinary-clinic-by-id'

export function makeGetVeterinaryClinicByIdUseCase() {
  const veterinaryClinicRepository = new VeterinaryClinicRepository()
  const getVeterinaryClinicByIdUseCase = new GetVeterinaryClinicByIdUseCase(veterinaryClinicRepository)

  return getVeterinaryClinicByIdUseCase
}
