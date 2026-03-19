import { RescueRepository } from '@/repositories/rescue.repository'
import { ListRescuesUseCase } from './list-rescues'

export function makeListRescuesUseCase() {
  const rescueRepository = new RescueRepository()
  return new ListRescuesUseCase(rescueRepository)
}
