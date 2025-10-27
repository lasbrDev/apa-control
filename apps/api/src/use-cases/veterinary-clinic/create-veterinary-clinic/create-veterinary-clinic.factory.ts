import { VeterinaryClinicRepository } from '@/repositories/veterinary-clinic.repository'
import { CreateVeterinaryClinicUseCase } from '@/use-cases/veterinary-clinic/create-veterinary-clinic/create-veterinary-clinic'

export function makeCreateVeterinaryClinicUseCase() {
  const veterinaryClinicRepository = new VeterinaryClinicRepository()
  const createVeterinaryClinicUseCase = new CreateVeterinaryClinicUseCase(veterinaryClinicRepository)

  return createVeterinaryClinicUseCase
}
