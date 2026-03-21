import ExcelJS from 'exceljs'

type XlsxCell = string | number | boolean | null | undefined
type XlsxRow = Record<string, XlsxCell>

export async function createSimpleXlsxBuffer(sheetName: string, rows: XlsxRow[]) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(sheetName)

  if (rows.length === 0) {
    worksheet.addRow(['Sem dados'])
  } else {
    const headers = Object.keys(rows[0])
    worksheet.columns = headers.map((header) => ({ header, key: header, width: 24 }))
    // biome-ignore lint/complexity/noForEach: <explanation>
    rows.forEach((row) => worksheet.addRow(row))
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
