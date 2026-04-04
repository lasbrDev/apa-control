import { readFileSync } from 'node:fs'
import { makeListAnimalsUseCase } from '@/use-cases/animal/list-animals/list-animals.factory'
import { getRootFolder } from '@/utils/get-root-folder'
import { createCsvFromJson2Csv } from '@/utils/report/csv-export'
import { generatePdfFromTemplate } from '@/utils/report/pdf-generator'
import { createSimpleXlsxBuffer } from '@/utils/report/xlsx-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listAnimalsSchema } from './list-animals.schema'

function getApaControlLogoDataUrl() {
  const logoPath = getRootFolder('../../administrativo/src/assets/img/logo.png')
  const logoBuffer = readFileSync(logoPath)
  return `data:image/png;base64,${logoBuffer.toString('base64')}`
}

function mapEnum(val: string | null | undefined, dict: Record<string, string>) {
  return val && dict[val] ? dict[val] : (val ?? '')
}

export async function listAnimalsController(request: FastifyRequest, reply: FastifyReply) {
  const data = listAnimalsSchema.parse(request.query)
  const listAnimalsUseCase = makeListAnimalsUseCase()

  if (data.exportType) {
    const { exportType, ...filters } = data
    const [, items] = await listAnimalsUseCase.execute({ ...filters, page: undefined, perPage: undefined })

    const formattedItems = items.map((item) => ({
      ...item,
      species: mapEnum(item.species, { canina: 'Cachorro', felina: 'Gato', outros: 'Outros' }),
      size: mapEnum(item.size, { pequeno: 'Pequeno', medio: 'Médio', grande: 'Grande' }),
      sex: mapEnum(item.sex, { macho: 'Macho', femea: 'Fêmea' }),
      healthCondition: mapEnum(item.healthCondition, { saudavel: 'Saudável', estavel: 'Estável', critica: 'Crítica' }),
      status: mapEnum(item.status, { disponivel: 'Disponível', em_tratamento: 'Em Tratamento', adotado: 'Adotado' }),
    }))

    const rows = formattedItems.map((item) => ({
      Nome: item.name,
      Especie: item.species,
      Raca: item.breed ?? '',
      Porte: item.size,
      Sexo: item.sex,
      Idade: item.birthYear ? `${new Date().getFullYear() - item.birthYear} anos` : '-',
      Condicao: item.healthCondition,
      Status: item.status,
      Entrada: item.entryDate ? new Date(item.entryDate).toLocaleDateString('pt-BR') : '',
    }))

    if (exportType === 'csv') {
      const csv = await createCsvFromJson2Csv(rows)
      reply.type('text/csv; charset=utf-8')
      reply.header('Content-Disposition', 'attachment; filename="animais.csv"')
      return csv
    }

    if (exportType === 'xlsx') {
      const xlsxBuffer = await createSimpleXlsxBuffer('Animais', rows)
      reply.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      reply.header('Content-Disposition', 'attachment; filename="animais.xlsx"')
      return xlsxBuffer
    }

    const pdfTemplatePath = getRootFolder('layout/pdf/report-base.ejs')
    const headers = ['Nome', 'Espécie', 'Raça', 'Porte', 'Sexo', 'Idade', 'Condição', 'Status', 'Entrada']
    const pdfRows = formattedItems.map((item) => [
      item.name,
      item.species,
      item.breed ?? '',
      item.size,
      item.sex,
      item.birthYear ? `${new Date().getFullYear() - item.birthYear} anos` : '-',
      item.healthCondition,
      item.status,
      item.entryDate ? new Date(item.entryDate).toLocaleDateString('pt-BR') : '',
    ])

    const pdf = await generatePdfFromTemplate(pdfTemplatePath, {
      title: 'Relatório de Animais',
      logoDataUrl: getApaControlLogoDataUrl(),
      generatedAt: new Date().toLocaleString('pt-BR'),
      period: null,
      headers,
      rows: pdfRows,
    })

    reply.type('application/pdf')
    reply.header('Content-Disposition', 'attachment; filename="animais.pdf"')
    return pdf
  }

  const [count, items] = await listAnimalsUseCase.execute(data)

  reply.header('X-Total-Count', count)

  return items
}
