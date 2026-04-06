import { VeterinaryClinicRepository } from '@/repositories/veterinary-clinic.repository'
import { DisableVeterinaryClinicUseCase } from '@/use-cases/veterinary-clinic/disable-veterinary-clinic/disable-veterinary-clinic'

export function makeDisableVeterinaryClinicUseCase() {
  const veterinaryClinicRepository = new VeterinaryClinicRepository()
  const disableVeterinaryClinicUseCase = new DisableVeterinaryClinicUseCase(veterinaryClinicRepository)

  return disableVeterinaryClinicUseCase
}
