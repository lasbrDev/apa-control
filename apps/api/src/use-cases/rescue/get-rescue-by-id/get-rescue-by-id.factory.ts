import { RescueRepository } from '@/repositories/rescue.repository'
import { GetRescueByIdUseCase } from './get-rescue-by-id'

export function makeGetRescueByIdUseCase() {
  const rescueRepository = new RescueRepository()
  return new GetRescueByIdUseCase(rescueRepository)
}
