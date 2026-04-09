import { readFileSync } from 'node:fs'
import { getRootFolder } from '@/utils/get-root-folder'
import { createCsvFromJson2Csv } from '@/utils/report/csv-export'
import { generatePdfFromTemplate } from '@/utils/report/pdf-generator'
import { maskCellPhone, maskCpfCnpj } from '@/utils/report/report-helpers'
import { createSimpleXlsxBuffer } from '@/utils/report/xlsx-export'
import { timeZoneName } from '@/utils/time-zone'
import { tz } from '@date-fns/tz'
import { format } from 'date-fns'
import type { FastifyReply } from 'fastify'

type ExportType = 'csv' | 'xlsx' | 'pdf'

type ExportListOptions = {
  pdfLandscape?: boolean
}

function getApaControlLogoDataUrl() {
  const logoPath = getRootFolder('assets/img/logo.png')
  const logoBuffer = readFileSync(logoPath)
  return `data:image/png;base64,${logoBuffer.toString('base64')}`
}

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return format(value, 'dd/MM/yyyy', { in: tz(timeZoneName.SP) })
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function normalizeHeader(rawKey: string): string {
  const dictionary: Record<string, string> = {
    id: 'ID',
    name: 'Nome',
    title: 'Título',
    description: 'Descrição',
    status: 'Status',
    cpf: 'CPF',
    cnpj: 'CNPJ',
    phone: 'Telefone',
    email: 'Email',
    value: 'Valor',
    averageCost: 'Custo médio',
    actualCost: 'Custo real',
    fundraisingGoal: 'Meta de arrecadação',
    publicationDate: 'Data de publicação',
    appointmentDate: 'Data da consulta',
    occurrenceDate: 'Data da ocorrência',
    procedureDate: 'Data do procedimento',
    rescueDate: 'Data do resgate',
    destinationDate: 'Data do destino',
    adoptionDate: 'Data da adoção',
    dueDate: 'Vencimento',
    paymentDate: 'Pagamento',
    reversalDate: 'Estorno',
    entryDate: 'Data de entrada',
    startDate: 'Data de início',
    endDate: 'Data de término',
    createdAt: 'Criado em',
    updatedAt: 'Atualizado em',
    animalName: 'Animal',
    employeeName: 'Responsável',
    clinicName: 'Clínica',
    campaignTitle: 'Campanha',
    campaignTypeName: 'Tipo de campanha',
    transactionTypeName: 'Tipo de transação',
    profileName: 'Perfil',
    disabledAt: 'Desativado em',
    active: 'Ativo',
    urgency: 'Urgência',
    consultationType: 'Modalidade',
    occurrenceTypeName: 'Tipo de ocorrência',
    destinationTypeName: 'Tipo de destino',
    appointmentTypeName: 'Tipo de consulta',
    procedureTypeName: 'Tipo de procedimento',
    locationFound: 'Local encontrado',
    circumstances: 'Circunstâncias',
    foundConditions: 'Condições encontradas',
    immediateProcedures: 'Procedimentos imediatos',
    observations: 'Observações',
    symptomsPresented: 'Sintomas apresentados',
    species: 'Espécie',
    breed: 'Raça',
    size: 'Porte',
    sex: 'Sexo',
    birthYear: 'Ano de Nascimento',
    healthCondition: 'Condição de saúde',
    login: 'Login',
    responsible: 'Responsável',
    category: 'Categoria',
    type: 'Tipo',
    reason: 'Motivo',
    adopterName: 'Adotante',
    adaptationPeriod: 'Período de adaptação',
    proof: 'Comprovante',
  }

  if (dictionary[rawKey]) return dictionary[rawKey]

  return rawKey
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

const enumLabels: Record<string, string> = {
  clinico: 'Clínico',
  cirurgico: 'Cirúrgico',
  exame: 'Exame',
  vacina: 'Vacina',
  rotina: 'Rotina',
  urgente: 'Urgente',
  clinica: 'Clínica',
  domiciliar: 'Domiciliar',
  emergencia: 'Emergência',
  agendado: 'Agendado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
  receita: 'Receita',
  despesa: 'Despesa',
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  estornado: 'Estornado',
  ativa: 'Ativa',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

function toNumberIfPossible(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value)
  if (value !== null && typeof value === 'object' && typeof (value as { toNumber?: unknown }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber()
  }
  return null
}

function isDateLikeKey(key: string): boolean {
  return /date|at$/i.test(key)
}

function formatValueByKey(key: string, value: unknown): string {
  if (value === null || value === undefined) return ''

  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'

  if (typeof value === 'string' && enumLabels[value]) return enumLabels[value]

  const keyLower = key.toLowerCase()

  if (/(cpf|cnpj|document)/i.test(keyLower)) {
    return maskCpfCnpj(String(value))
  }

  if (/(phone|telefone|celular)/i.test(keyLower)) {
    return maskCellPhone(String(value))
  }

  if (/(value|cost|goal|amount|price|valor|custo|meta|total)/i.test(keyLower)) {
    const numeric = toNumberIfPossible(value)
    if (numeric !== null) return formatMoney(numeric)
  }

  if (value instanceof Date) {
    return format(value, 'dd/MM/yyyy HH:mm:ss', { in: tz(timeZoneName.SP) })
  }

  if (typeof value === 'string' && isDateLikeKey(keyLower)) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      const hasTime = value.includes('T') || value.includes(':')
      return hasTime
        ? format(parsed, 'dd/MM/yyyy HH:mm:ss', { in: tz(timeZoneName.SP) })
        : format(parsed, 'dd/MM/yyyy', { in: tz(timeZoneName.SP) })
    }
  }

  return normalizeValue(value)
}

export async function exportListData(
  reply: FastifyReply,
  exportType: ExportType,
  title: string,
  filenameBase: string,
  items: object[],
  options: ExportListOptions = {},
) {
  const rawHeaders = items.length
    ? Object.keys(items[0]).filter((key) => !/^id$/i.test(key) && !/Id$/.test(key))
    : ['semDados']
  const headers = rawHeaders.map((header) => normalizeHeader(header))

  const rows = items.map((item) =>
    rawHeaders.reduce<Record<string, string>>((acc, rawHeader, index) => {
      const record = item as unknown as Record<string, unknown>
      acc[headers[index]] = formatValueByKey(rawHeader, record[rawHeader])
      return acc
    }, {}),
  )

  if (exportType === 'csv') {
    const csv = await createCsvFromJson2Csv(rows)
    reply.type('text/csv; charset=utf-8')
    reply.header('Content-Disposition', `attachment; filename="${filenameBase}.csv"`)
    return csv
  }

  if (exportType === 'xlsx') {
    const xlsxBuffer = await createSimpleXlsxBuffer(title, rows)
    reply.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    reply.header('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`)
    return xlsxBuffer
  }

  const pdfTemplatePath = getRootFolder('layout/pdf/report-base.ejs')
  const pdfRows = rows.map((row) => headers.map((header) => row[header] ?? ''))
  const pdf = await generatePdfFromTemplate(
    pdfTemplatePath,
    {
      title,
      logoDataUrl: getApaControlLogoDataUrl(),
      generatedAt: format(new Date(), 'dd/MM/yyyy HH:mm:ss', { in: tz(timeZoneName.SP) }),
      period: null,
      headers,
      rows: pdfRows,
    },
    { landscape: options.pdfLandscape },
  )

  reply.type('application/pdf')
  reply.header('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`)
  return pdf
}
