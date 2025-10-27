import { VeterinaryClinicRepository } from '@/repositories/veterinary-clinic.repository'
import { ListVeterinaryClinicsUseCase } from '@/use-cases/veterinary-clinic/list-veterinary-clinics/list-veterinary-clinics'

export function makeListVeterinaryClinicsUseCase() {
  const veterinaryClinicRepository = new VeterinaryClinicRepository()
  const listVeterinaryClinicsUseCase = new ListVeterinaryClinicsUseCase(veterinaryClinicRepository)

  return listVeterinaryClinicsUseCase
}
