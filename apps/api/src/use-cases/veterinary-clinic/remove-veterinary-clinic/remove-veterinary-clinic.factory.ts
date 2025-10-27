import { VeterinaryClinicRepository } from '@/repositories/veterinary-clinic.repository'
import { RemoveVeterinaryClinicUseCase } from '@/use-cases/veterinary-clinic/remove-veterinary-clinic/remove-veterinary-clinic'

export function makeRemoveVeterinaryClinicUseCase() {
  const veterinaryClinicRepository = new VeterinaryClinicRepository()
  const removeVeterinaryClinicUseCase = new RemoveVeterinaryClinicUseCase(veterinaryClinicRepository)

  return removeVeterinaryClinicUseCase
}
