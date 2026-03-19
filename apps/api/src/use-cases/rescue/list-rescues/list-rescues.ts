import type { RescueRepository } from '@/repositories/rescue.repository'
import type { ListRescuesData, RescueWithDetails } from './list-rescues.dto'

export class ListRescuesUseCase {
  constructor(private rescueRepository: RescueRepository) {}

  async execute(data: ListRescuesData): Promise<[number, RescueWithDetails[]]> {
    return this.rescueRepository.list(data)
  }
}
