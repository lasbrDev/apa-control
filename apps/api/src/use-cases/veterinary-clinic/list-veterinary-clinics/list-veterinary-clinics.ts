import type { VeterinaryClinicRepository } from '@/repositories'
import type { ListVeterinaryClinicsDTO, ListVeterinaryClinicsData } from './list-veterinary-clinics.dto'

export class ListVeterinaryClinicsUseCase {
  constructor(private veterinaryClinicRepository: VeterinaryClinicRepository) {}

  async execute(data: ListVeterinaryClinicsData): Promise<[number, ListVeterinaryClinicsDTO[]]> {
    const [count, items] = await this.veterinaryClinicRepository.list(data)
    return [count, items]
  }
}
