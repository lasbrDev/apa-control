import { AdopterRepository } from '@/repositories/adopter.repository'
import { ListAdoptersUseCase } from '@/use-cases/adopter/list-adopters/list-adopters'

export function makeListAdoptersUseCase() {
  const adopterRepository = new AdopterRepository()
  const listAdoptersUseCase = new ListAdoptersUseCase(adopterRepository)

  return listAdoptersUseCase
}
