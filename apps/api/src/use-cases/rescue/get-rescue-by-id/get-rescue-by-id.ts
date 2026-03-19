import type { RescueRepository } from '@/repositories/rescue.repository'
import { ApiError } from '@/utils/api-error'
import type { GetRescueByIdDTO, GetRescueByIdData } from './get-rescue-by-id.dto'

export class GetRescueByIdUseCase {
  constructor(private rescueRepository: RescueRepository) {}

  async execute(data: GetRescueByIdData): Promise<GetRescueByIdDTO> {
    const rescue = await this.rescueRepository.findById(data.id)

    if (!rescue) {
      throw new ApiError('Resgate não encontrado.', 404)
    }

    return rescue
  }
}
