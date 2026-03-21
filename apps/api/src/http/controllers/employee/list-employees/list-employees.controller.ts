import { makeListEmployeesUseCase } from '@/use-cases/employee/list-employees/list-employees.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listEmployeesSchema } from './list-employees.schema'

export async function listEmployeesController(request: FastifyRequest, reply: FastifyReply) {
  const data = listEmployeesSchema.parse(request.query)
  const listEmployeesUseCase = makeListEmployeesUseCase()
  const [count, items] = await listEmployeesUseCase.execute(data)

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Funcionarios', 'funcionarios', items)
  }

  reply.header('X-Total-Count', count)

  return items
}
