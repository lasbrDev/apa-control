import { VeterinaryClinicRepository } from '@/repositories/veterinary-clinic.repository'
import { UpdateVeterinaryClinicUseCase } from '@/use-cases/veterinary-clinic/update-veterinary-clinic/update-veterinary-clinic'

export function makeUpdateVeterinaryClinicUseCase() {
  const veterinaryClinicRepository = new VeterinaryClinicRepository()
  const updateVeterinaryClinicUseCase = new UpdateVeterinaryClinicUseCase(veterinaryClinicRepository)

  return updateVeterinaryClinicUseCase
}
