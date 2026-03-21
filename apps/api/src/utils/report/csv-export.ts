import { stringify } from 'csv-stringify/sync'
import { json2csv } from 'json-2-csv'

type CsvCell = string | number | boolean | null | undefined
type CsvRow = Record<string, CsvCell>

export async function createCsvFromJson2Csv(rows: CsvRow[]) {
  return await json2csv(rows, { emptyFieldValue: '' })
}

export function createCsvFromStringify(rows: CsvRow[]) {
  if (!rows.length) return ''

  return stringify(rows, {
    header: true,
    columns: Object.keys(rows[0]),
    delimiter: ';',
  })
}
