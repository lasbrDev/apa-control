import { tz } from '@date-fns/tz'
import { format } from 'date-fns'

export function maskCpfCnpj(value: string): string {
  if (!value) return ''

  const cleaned = value.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  if (cleaned.length === 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  return value
}

export function maskCellPhone(value: string): string {
  if (!value) return ''

  const cleaned = value.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return value
}

export function maskDecimal(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function createFormatDate(timeZone: string) {
  return (date: Date, pattern: string): string => {
    return format(date, pattern, { in: tz(timeZone) })
  }
}

export function createFormatDateOnly() {
  return (date: Date, pattern: string): string => {
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    return format(localDate, pattern)
  }
}
