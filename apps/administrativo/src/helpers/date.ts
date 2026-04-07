import { format, parseISO } from 'date-fns'

function parseDate(date: Date | string): Date {
  if (typeof date !== 'string') return date
  return date.includes('T') ? parseISO(date) : new Date(`${date}T00:00:00`)
}

export function formatDate(date: Date | string | undefined | null) {
  return date ? format(parseDate(date), 'dd/MM/yyyy') : ''
}

export function formatDateTime(date: Date | string | undefined | null) {
  return date ? format(parseDate(date), 'dd/MM/yyyy HH:mm:ss') : ''
}

export function formatTime(date: Date | string | undefined | null) {
  return date ? format(parseDate(date), 'HH:mm') : ''
}
