import { readFileSync } from 'node:fs'
import { makeGetAnimalHistoryByIdUseCase } from '@/use-cases/animal-history/get-animal-history-by-id/get-animal-history-by-id.factory'
import { makeGetAnimalByIdUseCase } from '@/use-cases/animal/get-animal-by-id/get-animal-by-id.factory'
import { makeListRescuesUseCase } from '@/use-cases/rescue/list-rescues/list-rescues.factory'
import { getRootFolder } from '@/utils/get-root-folder'
import { createCsvFromJson2Csv } from '@/utils/report/csv-export'
import { generatePdfFromTemplate } from '@/utils/report/pdf-generator'
import { createSimpleXlsxBuffer } from '@/utils/report/xlsx-export'
import { timeZoneName } from '@/utils/time-zone'
import { tz } from '@date-fns/tz'
import { format } from 'date-fns'
import type { FastifyReply, FastifyRequest } from 'fastify'

import { getAnimalHistoryByIdQuerySchema, getAnimalHistoryByIdSchema } from './get-animal-history-by-id.schema'

function getApaControlLogoDataUrl() {
  const logoPath = getRootFolder('assets/img/logo.png')
  const logoBuffer = readFileSync(logoPath)
  return `data:image/png;base64,${logoBuffer.toString('base64')}`
}

function formatHistoryType(type: string) {
  const map: Record<string, string> = {
    resgate: 'Resgate',
    cadastro: 'Cadastro',
    consulta: 'Consulta',
    procedimento: 'Procedimento',
    ocorrencia: 'Ocorrência',
    destino_final: 'Destino Final',
    despesa: 'Despesa',
    receita: 'Receita',
  }
  return map[type] ?? type
}

function formatHistoryValue(value: string | null) {
  if (!value) return ''
  try {
    const parsed = JSON.parse(value) as unknown
    const fieldLabelMap: Record<string, string> = {
      name: 'Nome',
      species: 'Espécie',
      breed: 'Raça',
      size: 'Porte',
      sex: 'Sexo',
      birthYear: 'Ano de Nascimento',
      healthCondition: 'Condição de Saúde',
      entryDate: 'Data de Entrada',
      observations: 'Observações',
      status: 'Status',
      rescueDate: 'Data do Resgate',
      locationFound: 'Local Encontrado',
      circumstances: 'Circunstâncias',
      foundConditions: 'Condições em que foi encontrado',
      immediateProcedures: 'Procedimentos Imediatos',
      destinationTypeId: 'Tipo de Destino Final',
      destinationDate: 'Data do Destino Final',
      reason: 'Motivo',
      proof: 'Comprovante',
      animal: 'Animal',
    }
    const valueLabelMapByField: Record<string, Record<string, string>> = {
      species: { canina: 'Cachorro', felina: 'Gato', outros: 'Outros' },
      size: { pequeno: 'Pequeno', medio: 'Médio', grande: 'Grande' },
      sex: { macho: 'Macho', femea: 'Fêmea' },
      healthCondition: { saudavel: 'Saudável', estavel: 'Estável', critica: 'Crítica' },
      status: { pendente: 'Pendente', ativo: 'Ativo', inativo: 'Inativo' },
    }
    const translateValue = (fieldKey: string, fieldValue: unknown): unknown => {
      if (typeof fieldValue === 'string') {
        return valueLabelMapByField[fieldKey]?.[fieldValue] ?? fieldValue
      }
      return fieldValue
    }
    const translatePayload = (input: unknown): unknown => {
      if (Array.isArray(input)) return input.map(translatePayload)
      if (input && typeof input === 'object') {
        const entries = Object.entries(input as Record<string, unknown>).map(([key, fieldValue]) => {
          const translatedValue =
            fieldValue && typeof fieldValue === 'object'
              ? translatePayload(fieldValue)
              : translateValue(key, fieldValue)
          return [fieldLabelMap[key] ?? key, translatedValue]
        })
        return Object.fromEntries(entries)
      }
      return input
    }
    return JSON.stringify(translatePayload(parsed))
  } catch {
    return value
  }
}

export async function getAnimalHistoryByIdController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = getAnimalHistoryByIdSchema.parse(request.params)
  const { type, types, startDate, endDate, employeeId, exportType } = getAnimalHistoryByIdQuerySchema.parse(
    request.query,
  )

  const getAnimalHistoryByIdUseCase = makeGetAnimalHistoryByIdUseCase()
  const result = await getAnimalHistoryByIdUseCase.execute({
    id,
    types: types ?? (type ? [type] : undefined),
    startDate,
    endDate,
    employeeId,
  })

  if (exportType) {
    const getAnimalByIdUseCase = makeGetAnimalByIdUseCase()
    const animal = await getAnimalByIdUseCase.execute({ id })

    const rows = result.map((item) => ({
      Data: item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm:ss', { in: tz(timeZoneName.SP) }) : '',
      Tipo: formatHistoryType(item.type),
      Descrição: item.description,
      'Valor Antigo': formatHistoryValue(item.oldValue),
      'Valor Novo': formatHistoryValue(item.newValue),
      Por: item.employeeName ?? '',
    }))

    if (exportType === 'csv') {
      const csv = await createCsvFromJson2Csv(rows)
      reply.type('text/csv; charset=utf-8')
      reply.header('Content-Disposition', `attachment; filename="historico-animal-${id}.csv"`)
      return csv
    }

    if (exportType === 'xlsx') {
      const xlsxBuffer = await createSimpleXlsxBuffer(`Histórico - ${animal.name}`, rows)
      reply.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      reply.header('Content-Disposition', `attachment; filename="historico-animal-${id}.xlsx"`)
      return xlsxBuffer
    }

    const mapEnum = (val: string | null | undefined, dict: Record<string, string>) =>
      val && dict[val] ? dict[val] : val

    const listRescuesUseCase = makeListRescuesUseCase()
    const [, rescues] = await listRescuesUseCase.execute({ animalId: id, page: 1, perPage: 1 })
    const rescue = rescues.length > 0 ? rescues[0] : null

    const pdfTemplatePath = getRootFolder('layout/pdf/report-animal-history.ejs')
    const headers = ['Data', 'Tipo', 'Descrição', 'Valor Antigo', 'Valor Novo', 'Por']
    const pdfRows = result.map((item) => [
      item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm:ss', { in: tz(timeZoneName.SP) }) : '',
      formatHistoryType(item.type),
      item.description,
      formatHistoryValue(item.oldValue),
      formatHistoryValue(item.newValue),
      item.employeeName ?? '',
    ])

    const pdf = await generatePdfFromTemplate(pdfTemplatePath, {
      title: `Histórico do Animal - ${animal.name}`,
      logoDataUrl: getApaControlLogoDataUrl(),
      generatedAt: format(new Date(), 'dd/MM/yyyy HH:mm:ss', { in: tz(timeZoneName.SP) }),
      animal: {
        name: animal.name,
        species: mapEnum(animal.species, { canina: 'Cachorro', felina: 'Gato', outros: 'Outros' }),
        breed: animal.breed,
        size: mapEnum(animal.size, { pequeno: 'Pequeno', medio: 'Médio', grande: 'Grande' }),
        sex: mapEnum(animal.sex, { macho: 'Macho', femea: 'Fêmea' }),
        birthYear: animal.birthYear,
        healthCondition: mapEnum(animal.healthCondition, {
          saudavel: 'Saudável',
          estavel: 'Estável',
          critica: 'Crítica',
        }),
        status: mapEnum(animal.status, {
          pendente: 'Pendente',
          ativo: 'Ativo',
          inativo: 'Inativo',
        }),
        entryDate: animal.entryDate
          ? format(new Date(animal.entryDate), 'dd/MM/yyyy', { in: tz(timeZoneName.SP) })
          : '',
      },
      rescue: rescue
        ? {
            rescueDate: rescue.rescueDate
              ? format(new Date(rescue.rescueDate), 'dd/MM/yyyy', { in: tz(timeZoneName.SP) })
              : '',
            locationFound: rescue.locationFound,
            circumstances: rescue.circumstances,
            foundConditions: rescue.foundConditions,
            immediateProcedures: rescue.immediateProcedures,
            observations: rescue.observations,
          }
        : null,
      headers,
      rows: pdfRows,
    })

    reply.type('application/pdf')
    reply.header('Content-Disposition', `attachment; filename="historico-animal-${id}.pdf"`)
    return pdf
  }

  return result
}
