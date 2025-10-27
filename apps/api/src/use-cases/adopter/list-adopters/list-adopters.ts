import type { AdopterRepository } from '@/repositories'
import type { ListAdoptersDTO, ListAdoptersData } from './list-adopters.dto'

export class ListAdoptersUseCase {
  constructor(private adopterRepository: AdopterRepository) {}

  async execute(data: ListAdoptersData): Promise<[number, ListAdoptersDTO[]]> {
    const [count, items] = await this.adopterRepository.list(data)
    return [count, items]
  }
}
